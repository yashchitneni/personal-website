import { createClient } from '@supabase/supabase-js';
import { BiofeedbackEntry, DailyAggregation, Metric } from '../../../types/metrics';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function insertBiofeedbackEntry(newData: Partial<BiofeedbackEntry>): Promise<boolean> {
    try {

        // Prepare the entry data
        const entryData: BiofeedbackEntry = {
            date: newData.date!,
            time: newData.time!,
            metrics: {
                sex_drive: { score: 0, notes: '' },
                mood: { score: 0, notes: '' },
                digestion: { score: 0, notes: '' },
                soreness: { score: 0, notes: '' },
                gym_performance: { score: 0, notes: '' },
                sleep_quality: { score: 0, notes: '' },
                energy: { score: 0, notes: '' },
                hunger_levels: { score: 0, notes: '' },
                cravings: { score: 0, notes: '' },
                ...normalizeMetrics(newData.metrics), // Normalize incoming metrics
            },
            additional_notes: newData.additional_notes || [],
            summary: newData.summary || '',
        };

        // Insert the data into the database
        const { data, error } = await supabase
            .from('biofeedback')
            .insert(entryData)
            .select()
            .single();

        if (error) {
            throw new Error(`Insert Error: ${error.message}`); // Propagate the error
        }

        // Automatically aggregate after each entry
        await aggregateDailyEntries(entryData.date); // Use entryData.date for aggregation

        return true;
    } catch (error) {
        throw false; // Propagate the error
    }
}

// Helper function to normalize metric keys
function normalizeMetrics(metrics: any) {
    const normalized: any = {
        hunger_levels: { score: 0, notes: '' },
        gym_performance: { score: 0, notes: '' },
        soreness: { score: 0, notes: '' },
        sex_drive: { score: 0, notes: '' },
        mood: { score: 0, notes: '' },
        digestion: { score: 0, notes: '' },
        sleep_quality: { score: 0, notes: '' },
        energy: { score: 0, notes: '' },
        cravings: { score: 0, notes: '' },
    };

    for (const key in metrics) {
        switch (key) {
            case 'Hunger Levels':
                normalized.hunger_levels = metrics[key];
                break;
            case 'Gym Performance':
                normalized.gym_performance = metrics[key];
                break;
            case 'Soreness':
                normalized.soreness = metrics[key];
                break;
            case 'Sex Drive':
                normalized.sex_drive = metrics[key];
                break;
            case 'Mood':
                normalized.mood = metrics[key];
                break;
            case 'Digestion':
                normalized.digestion = metrics[key];
                break;
            case 'Sleep Quality':
                normalized.sleep_quality = metrics[key];
                break;
            case 'Energy':
                normalized.energy = metrics[key];
                break;
            case 'Cravings':
                normalized.cravings = metrics[key];
                break;
            default:
                // Keep other metrics unchanged
                break;
        }
    }
    return normalized;
}

export async function aggregateDailyEntries(date: string): Promise<DailyAggregation | null> {
    try {
        // Fetch existing aggregation for the given date
        const { data: existingAggregation, error: fetchError } = await supabase
            .from('daily_aggregations')
            .select('*')
            .eq('date', date)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw new Error(`Fetch Error: ${fetchError.message}`);
        }

        // Initialize aggregation object
        const aggregation: DailyAggregation = existingAggregation || {
            date: date,
            entry_timestamp: new Date().toISOString(),
            metrics: {
                sex_drive: { score: 0, notes: '', aggregated_note: '' },
                mood: { score: 0, notes: '', aggregated_note: '' },
                digestion: { score: 0, notes: '', aggregated_note: '' },
                soreness: { score: 0, notes: '', aggregated_note: '' },
                gym_performance: { score: 0, notes: '', aggregated_note: '' },
                sleep_quality: { score: 0, notes: '', aggregated_note: '' },
                energy: { score: 0, notes: '', aggregated_note: '' },
                hunger_levels: { score: 0, notes: '', aggregated_note: '' },
                cravings: { score: 0, notes: '', aggregated_note: '' },
            },
            additional_notes: [],
            summary: '',
        };

        // Fetch all biofeedback entries for the given date
        const { data: entries, error: fetchErrorEntries } = await supabase
            .from('biofeedback')
            .select('*')
            .eq('date', date);

        if (fetchErrorEntries) {
            throw new Error(`Fetch Error: ${fetchErrorEntries.message}`);
        }

        // Initialize counts, total scores, and unique notes for each metric
        const metricCounts: Record<string, number> = {};
        const metricTotals: Record<string, number> = {};
        const metricUniqueNotes: Record<string, Set<string>> = {};

        // Aggregate metrics from all entries
        entries.forEach(entry => {
            Object.entries(entry.metrics).forEach(([key, metric]) => {
                const typedKey = key as keyof typeof aggregation.metrics;
                const typedMetric = metric as Metric;

                if (typedMetric && typedMetric.score > 0) {
                    metricCounts[typedKey] = (metricCounts[typedKey] || 0) + 1;
                    metricTotals[typedKey] = (metricTotals[typedKey] || 0) + typedMetric.score;
                    
                    // Initialize the Set if it doesn't exist
                    if (!metricUniqueNotes[typedKey]) {
                        metricUniqueNotes[typedKey] = new Set();
                    }
                    // Add the note to the Set (this ensures uniqueness)
                    if (typedMetric.notes) {
                        metricUniqueNotes[typedKey].add(typedMetric.notes);
                    }
                }
            });
            
            const uniqueAdditionalNotes = new Set((entry.additional_notes as string[]).filter(Boolean));
            aggregation.additional_notes.push(...uniqueAdditionalNotes);
            
            aggregation.summary += (entry.summary || '') + ' ';
        });

        // Calculate averages and combine unique notes
        for (const key in aggregation.metrics) {
            const typedKey = key as keyof typeof aggregation.metrics;
            if (metricCounts[typedKey] > 0) {
                aggregation.metrics[typedKey].score = metricTotals[typedKey] / metricCounts[typedKey];
                // Join unique notes
                aggregation.metrics[typedKey].notes = Array.from(metricUniqueNotes[typedKey] || []).join(' ');
            }
            aggregation.metrics[typedKey].aggregated_note = `Average score: ${aggregation.metrics[typedKey].score.toFixed(2)}. Notes: ${aggregation.metrics[typedKey].notes}`;
        }

        // Remove duplicate additional notes
        aggregation.additional_notes = Array.from(new Set(aggregation.additional_notes));

        aggregation.summary = aggregation.summary.trim();

        // Upsert the aggregation
        const { error: upsertError } = await supabase
            .from('daily_aggregations')
            .upsert(aggregation);

        if (upsertError) {
            throw new Error(`Upsert Error: ${upsertError.message}`);
        }

        return aggregation;
    } catch (error) {
        throw error;
    }
}

export async function fetchDailyAggregations(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
        .from('daily_aggregations')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

    if (error) {
        return null;
    }

    return data;
}