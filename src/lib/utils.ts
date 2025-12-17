import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function obfuscateEmail(email: string): string {
  const [local, domain] = email.split('@')

  // Obfuscate local part
  const firstTwo = local.slice(0, 2)
  const lastTwo = local.slice(-2)
  const localObfuscated = `${firstTwo}***${lastTwo}`

  // Obfuscate domain
  const [, tld] = domain.split('.')
  const domainObfuscated = `***.${tld}`

  return `${localObfuscated}@${domainObfuscated}`
}