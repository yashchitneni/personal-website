import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import { auth } from "@clerk/nextjs/server";

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