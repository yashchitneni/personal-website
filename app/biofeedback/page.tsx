import { BiofeedbackChart } from '../components/BiofeedbackChart';

/**
 * Biofeedback page component.
 * @function BiofeedbackPage
 * @returns {JSX.Element} The rendered biofeedback page.
 * @description This component displays the biofeedback chart and serves as the main entry point for biofeedback tracking.
 */
export default function BiofeedbackPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Biofeedback Chart</h1>
      <BiofeedbackChart data={[]} selectedMetrics={[]} metrics={[]} onDataPointClick={function (data: { date: string; time: string; metrics: { [key: string]: { score: number; notes: string } }; additional_notes: string[]; summary: string }): void {
        throw new Error('Function not implemented.')
      } } />    </div>
  );
}