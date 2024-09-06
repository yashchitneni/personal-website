import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import { auth } from "@clerk/nextjs/server";

/**
 * Login page component.
 * @function LoginPage
 * @returns {Promise<JSX.Element>} The rendered login page component.
 * @description This component checks if a user is already authenticated. If so, it redirects to the dashboard. Otherwise, it displays the login form.
 */
export default async function LoginPage() {
  const { userId } = auth();

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <LoginForm />
    </div>
  )
}