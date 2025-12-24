import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useFollowStore } from "@/store/followStore";
import { Button } from "@/components/ui/button";
import { UserIcon, UserMinus, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function FollowersList() {
	const { followersResult, getFollowers, followUser, unfollowUser } = useFollowStore();
	const { accessToken } = useAuthStore();

	const fetchMore = () => {
		if (followersResult.page < followersResult.totalPages) {
			getFollowers({ page: followersResult.page + 1, size: followersResult.size });
		}
	};

	useEffect(() => {
		if (followersResult.data.length === 0 && accessToken) {
			getFollowers({ page: 1, size: 10 });
		}
	}, [followersResult, getFollowers, accessToken]);

	return (
		<div className="max-w-md lg:max-w-full mx-auto p-4 bg-background rounded-lg shadow-md">
			<h2 className="text-xl font-bold mb-4">Followers</h2>
			<InfiniteScroll
				dataLength={followersResult.data.length}
				next={fetchMore}
				hasMore={followersResult.page < followersResult.totalPages}
				loader={<p className="text-center py-2">Loading...</p>}
				scrollableTarget="followers-scroll"
			>
				<div id="followers-scroll" className="space-y-3">
					{followersResult.data.map((follower) => (
						<div
							key={follower._id}
							className="flex justify-between items-center p-3 border rounded-lg shadow-sm hover:bg-input"
						>
							<div className="flex items-center space-x-2">
								<UserIcon className="w-5 h-5 text-gray-500" />
								<span className="font-medium">{follower.username}</span>
							</div>
							{follower.isFollowing ? (
								<Button
									variant="destructive"
									size="sm"
									onClick={() => unfollowUser(follower._id)}
								>
									<UserMinus />
									Unfollow
								</Button>
							) : (
								<Button size="sm" onClick={() => followUser(follower._id)}>
									<UserPlus />
									Follow
								</Button>
							)}
						</div>
					))}
				</div>
			</InfiniteScroll>
		</div>
	);
}
