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

export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // keep 32-bit integer
  }

  // More variation in hue
  const hue = Math.abs(hash) % 360;

  // Vary saturation and lightness based on hash to get more distinct colors
  const saturation = 50 + (Math.abs(hash) % 30); // 50% - 79%
  const lightness = 40 + (Math.abs(hash) % 20);  // 40% - 59%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function formatLastSeen(date?: Date): string {
	if (!date) return 'Unknown';
	const d = new Date(date);
	const now = new Date(); 
	// Helper to format time as hh:mm:ss am/pm
	const timeString = d.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	});
	// Normalize dates to midnight for comparison 
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()); 
	if (target.getTime() === today.getTime()) {
		return `Today at ${timeString}`;
	} else if (target.getTime() === yesterday.getTime()) {
		return `Yesterday at ${timeString}`;
	} else {
		const dateString = d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
		return `${dateString} at ${timeString}`;
	}
}

export const scrollMessageIntoView = (messageId: string) => {
	const messageElement = document.querySelector(`[data-id='${messageId}']`);
	if (messageElement) {
		messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
};