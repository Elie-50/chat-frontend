import { UserMinus, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SearchUser } from "@/store/searchStore";
import { useFollowStore } from "@/store/followStore";

type Props = {
	user: SearchUser;
}

function UserSearchCard({ user }: Props) {
	const { loading, error, unfollowUser, followUser } = useFollowStore();

	const handleFollowAction = async () => {
		if (user.isFollowing) {
			unfollowUser(user._id);
		} else {
			followUser(user._id);
		}
	}

	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted/50">
			<div className="flex items-center gap-3">
				<div className="flex flex-col">
					<span className="text-sm font-medium">
						{user.username}
					</span>
					{/* Optional secondary text */}
					<span className="text-xs text-muted-foreground">@{user.username}</span>
				</div>
			</div>

			<Button
				onClick={handleFollowAction}
				disabled={loading}
				size="sm"
				variant="secondary"
				className="gap-1 hover:cursor-pointer"
			>
				{
					user.isFollowing ?
					<>
						<UserMinus className="h-4 w-4" />
						Unfollow
					</>
					:
					<>
						<UserPlus className="h-4 w-4" />
						Follow
					</>
				}
			</Button>
			{error && <p className="text-red-500">{error}</p>}
		</div>
	)
}

export default UserSearchCard
