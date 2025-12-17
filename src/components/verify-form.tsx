import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { obfuscateEmail } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore"
import { useState, type FormEvent } from "react";
import { Input } from "./ui/input";

function VerifyForm() {
  const { email, error, loading, verifyCode } = useAuthStore()
  const [code, setCode] = useState<string>('');

  if (!email) return null

  const formattedEmail = obfuscateEmail(email);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		await verifyCode({ email, code});
	}



  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Email sent!</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verification code sent to <span className="font-medium">{formattedEmail}</span>
          </p>
        </div>

        {/* Code Input */}
        <Field>
          <FieldLabel htmlFor="code">Verification Code</FieldLabel>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
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

export default VerifyForm