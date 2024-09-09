import BiofeedbackChart from '../components/BiofeedbackChart'

/**
 * Biofeedback page component.
 * @function BiofeedbackPage
 * @returns {JSX.Element} The rendered biofeedback page.
 */
export default function BiofeedbackPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Biofeedback Tracking</h1>
      <BiofeedbackChart />
    </div>
  )
}