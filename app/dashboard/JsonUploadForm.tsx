"use client";

import { Button } from "@/app/components/ui/button";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

interface BiofeedbackData {
  date: string;
  time: string;
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
  additional_notes: string[];
  summary: string;
}

/**
 * Form component for uploading JSON biofeedback data.
 * @function JsonUploadForm
 * @returns {JSX.Element} The rendered JSON upload form.
 */
export default function JsonUploadForm() {
  const { userId, getToken } = useAuth();
  const { user } = useUser();
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission and data upload.
   * @async
   * @function handleSubmit
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken({ template: "supabase" });
      if (!token) throw new Error("Not authenticated");

      // Initialize Supabase client here
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });

      const data: BiofeedbackData = JSON.parse(jsonData);
      const { error: insertError } = await supabase.from("biofeedback").insert({
        date: new Date(`${data.date}T${data.time}`),
        time: new Date(`${data.date}T${data.time}`),
        hunger_score: data.hunger_score,
        hunger_notes: data.hunger_notes,
        digestion_score: data.digestion_score,
        digestion_notes: data.digestion_notes,
        sleep_quality_score: data.sleep_quality_score,
        sleep_quality_notes: data.sleep_quality_notes,
        energy_levels_score: data.energy_levels_score,
        energy_levels_notes: data.energy_levels_notes,
        gym_performance_score: data.gym_performance_score,
        gym_performance_notes: data.gym_performance_notes,
        additional_notes: data.additional_notes,
        summary: data.summary
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setJsonData("");
      alert("Data uploaded successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <textarea
        value={jsonData}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonData(e.target.value)}
        placeholder="Paste your JSON data here"
        rows={10}
        className="w-full p-2 border rounded"
        required
      />
      <Button
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Uploading..." : "Upload Data"}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
