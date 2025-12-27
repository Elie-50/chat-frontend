import { formatLastSeen } from '@/lib/utils'
import type { Friend } from '@/store/searchStore'

function LastSeen({ user }: { user: Friend }) {
	const lastSeen = formatLastSeen(user.lastSeen);
	return (
		<div>
			{
				user.isOnline
					? <span className="text-xs text-green-500">Online</span>
					: <span className="text-xs text-muted-foreground">Last Seen: {lastSeen}</span>
			}
		</div>
	)
}

export default LastSeen
