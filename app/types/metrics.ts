export interface Metric {
    score: number;
    notes: string;
    aggregated_note?: string; 
}

export interface BiofeedbackEntry {
    id?: string;
    date: string;
    time: string;
    metrics: {
        sex_drive: Metric;
        mood: Metric;
        digestion: Metric;
        soreness: Metric;
        gym_performance: Metric;
        sleep_quality: Metric;
        energy: Metric;
        hunger_levels: Metric;
        cravings: Metric;
    };
    additional_notes: string[];
    summary: string;
}

export interface DailyAggregation {
    id?: string;
    date: string;
    entry_timestamp: string;
    metrics: {
        sex_drive: Metric;
        mood: Metric;
        digestion: Metric;
        soreness: Metric;
        gym_performance: Metric;
        sleep_quality: Metric;
        energy: Metric;
        hunger_levels: Metric;
        cravings: Metric;
    };
    additional_notes: string[];
    summary: string;
    aggregated_notes?: string; // {{ edit_2 }} Add optional aggregated_notes property
}

export interface BiofeedbackChartProps {
    data: DailyAggregation[];
    selectedMetrics: string[];
    metrics: { name: string; color: string }[];
    onDataPointClick: (data: DailyAggregation) => void;
    dateRange: { startDate: string; endDate: string };
}