declare module '@/types/supabase' {
    export interface Database {
      public: {
        Tables: {
          biofeedback: {
            Row: {
              id: number; // Assuming 'id' is a big integer
              date: string; // Use string for timestamp
              time: string; // Use string for timestamp
              hunger_score: number;
              hunger_notes: string;
              digestion_score: number;
              digestion_notes: string;
              sleep_quality_score: number;
              sleep_quality_notes: string;
              energy_levels_score: number;
              energy_levels_notes: string;
              gym_performance_score: number;
              gym_performance_notes: string;
              additional_notes: string[]; // Assuming ARRAY is represented as a string array
              summary: string;
              created_at: string; // Use string for timestamp
            };
          };
        };
      };
    };
  }