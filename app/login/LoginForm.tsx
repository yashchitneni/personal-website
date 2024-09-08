'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

/**
 * Login form component using Clerk for authentication.
 * @function LoginForm
 * @returns {JSX.Element} The rendered login form.
 * @description This component provides a form for users to log in using their email and password.
 */
export default function LoginForm() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const { signIn, setActive } = useSignIn()

  /**
   * Handles form submission and sign-in process.
   * @async
   * @function handleSubmit
   * @param {FormEvent<HTMLFormElement>} e - The form submission event.
   * @throws {Error} Throws an error if sign-in fails.
   * @returns {Promise<void>} A promise that resolves when the sign-in process is complete.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!signIn) return

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
      } else {
        console.error("Failed to sign in:", result)
      }
    } catch (err) {
      console.error("Error during sign in:", err)
    }
  }

  /**
   * Creates an input change handler for the given state setter.
   * @function handleInputChange
   * @param {React.Dispatch<React.SetStateAction<string>>} setter - The state setter function.
   * @returns {(e: ChangeEvent<HTMLInputElement>) => void} The input change handler.
   * @description This function returns a change event handler that updates the state with the input value.
   */
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>): 
    (e: ChangeEvent<HTMLInputElement>) => void => 
    (e: ChangeEvent<HTMLInputElement>) => setter(e.target.value)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={handleInputChange(setEmail)}
        placeholder="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={handleInputChange(setPassword)}
        placeholder="Password"
        required
      />
      <Button type="submit">
        Log in
      </Button>
    </form>
  )
}