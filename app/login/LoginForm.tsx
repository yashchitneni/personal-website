'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, setActive } = useSignIn()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
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