import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useFollowStore } from "@/store/followStore";
import { Button } from "@/components/ui/button";
import { UserIcon, UserMinus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function FollowingList() {
	const { followingResult, getFollowing, unfollowUser } = useFollowStore();
	const { accessToken } = useAuthStore();

	const fetchMore = () => {
		if (followingResult.page < followingResult.totalPages) {
			getFollowing({ page: followingResult.page + 1, size: followingResult.size });
		}
	};

	useEffect(() => {
		if (followingResult.data.length === 0 && accessToken) {
			getFollowing({ page: 1, size: 10 });
		}
	}, [followingResult, getFollowing, accessToken]);

	return (
		<div className="max-w-md lg:max-w-full mx-auto p-4 bg-background rounded-lg shadow-md">
			<h2 className="text-xl font-bold mb-4">Following</h2>
			<InfiniteScroll
				dataLength={followingResult.data.length}
				next={fetchMore}
				hasMore={followingResult.page < followingResult.totalPages}
				loader={<p className="text-center py-2">Loading...</p>}
				scrollableTarget="following-scroll"
			>
				<div id="following-scroll" className="space-y-3">
					{followingResult.data.map((user) => (
						<div
							key={user._id}
							className="flex justify-between items-center p-3 border rounded-lg shadow-sm hover:bg-input"
						>
							<div className="flex items-center space-x-2">
								<UserIcon className="w-5 h-5 text-gray-500" />
								<span className="font-medium">{user.username}</span>
							</div>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => unfollowUser(user._id)}
							>
								<UserMinus />
								Unfollow
							</Button>
						</div>
					))}
				</div>
			</InfiniteScroll>
		</div>
	);
}
