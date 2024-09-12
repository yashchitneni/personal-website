import { createClient } from '@supabase/supabase-js';
import { BiofeedbackEntry, DailyAggregation, Metric } from '../../../types/metrics';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function insertBiofeedbackEntry(newData: Partial<BiofeedbackEntry>, userId: string, date: string, time: string) {	
    const now = new Date();
    
    const entryData: BiofeedbackEntry = {
        user_id: userId,
        date: date, // Use the passed date
        time: time, // Use the passed time
        entry_timestamp: now.toISOString(),
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
            ...newData.metrics
        },
        additional_notes: newData.additional_notes || [],
        summary: newData.summary || '',
    };

    const { data, error } = await supabase
        .from('biofeedback')
        .insert(entryData)
        .select()
        .single();

    if (error) {
        console.error('Error inserting biofeedback entry:', error);
        return null;
    }

    // Automatically aggregate after each entry
    await aggregateDailyEntries(userId, date);

    return data;
}

export async function aggregateDailyEntries(userId: string, date: string): Promise<DailyAggregation | null> {
    const { data: entries, error: fetchError } = await supabase
        .from('biofeedback')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);

    if (fetchError) {
        console.error('Error fetching biofeedback entries:', fetchError);
        return null;
    }

    const aggregation: DailyAggregation = {
        user_id: userId,
        date: date,
        time: new Date().toISOString(),
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

    entries.forEach(entry => {
        Object.entries(entry.metrics).forEach(([key, metric]) => {
            const typedKey = key as keyof typeof aggregation.metrics;
            const typedMetric = metric as Metric;
            aggregation.metrics[typedKey].score += typedMetric.score;
            aggregation.metrics[typedKey].notes += typedMetric.notes + ' ';
        });
        aggregation.additional_notes.push(...entry.additional_notes);
        aggregation.summary += entry.summary + ' ';
    });

    // Calculate averages and trim notes
    for (const key in aggregation.metrics) {
        const typedKey = key as keyof typeof aggregation.metrics;
        aggregation.metrics[typedKey].score /= entries.length;
        aggregation.metrics[typedKey].notes = aggregation.metrics[typedKey].notes.trim();
        aggregation.metrics[typedKey].aggregated_note = `Average score: ${aggregation.metrics[typedKey].score.toFixed(2)}. Notes: ${aggregation.metrics[typedKey].notes}`;
    }

    aggregation.summary = aggregation.summary.trim();

    const { error: upsertError } = await supabase
        .from('daily_aggregations')
        .upsert(aggregation);

    if (upsertError) {
        console.error('Error upserting daily aggregation:', upsertError);
        return null;
    }

    return aggregation;
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
        console.error('Error fetching daily aggregations:', error);
        return null;
    }

    return data;
}