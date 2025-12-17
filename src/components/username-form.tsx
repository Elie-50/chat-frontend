import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { useAuthStore } from "@/store/authStore"
import { useState, type FormEvent } from "react";
import { Input } from "./ui/input";

function UsernameForm() {
  const { error, loading, updateUser } = useAuthStore()
  const [username, setUsername] = useState<string>('');

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		await updateUser({ username });
	}

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Your username is blank!</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please fill the form below to set your username.
          </p>
        </div>

        {/* Code Input */}
        <Field>
          <FieldLabel htmlFor="code">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Field>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center font-semibold">{error}</p>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button disabled={loading} type="submit" className="w-full">
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UsernameForm