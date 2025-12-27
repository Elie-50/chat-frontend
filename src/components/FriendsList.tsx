import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchStore } from "@/store/searchStore";
import { MessageCircleIcon, UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import LastSeen from "./LastSeen";

export default function FriendsList() {
	const { friendsSearch, fetchFriends } = useSearchStore();
	const { accessToken } = useAuthStore();

	const fetchMore = () => {
		if (friendsSearch.currentPage <= friendsSearch.totalPages) {
			fetchFriends({ page: friendsSearch.currentPage, size: 20 });
		}
	};

	useEffect(() => {
		if (friendsSearch.friends.length === 0 && accessToken) {
			fetchFriends({ page: 1, size: 20 });
		}
	}, [fetchFriends, friendsSearch, accessToken]);

	return (
		<div className="max-w-md  lg:max-w-full mx-auto p-4 bg-background rounded-lg shadow-md">
			<h2 className="text-xl font-bold mb-4">Friends</h2>
			<InfiniteScroll
				dataLength={friendsSearch.friends.length}
				next={fetchMore}
				hasMore={friendsSearch.currentPage < friendsSearch.totalPages}
				loader={<p className="text-center py-2">Loading...</p>}
				scrollableTarget="friends-scroll"
			>
				<div id="friends-scroll" className="space-y-3">
					{friendsSearch.friends.map((friend) => (
						<div
							key={friend._id}
							className="flex items-center justify-between p-3 border rounded-lg shadow-sm hover:bg-input"
						>
							<div className="flex flex-col">
								<div className="flex flex-row">
									<UserIcon className="w-5 h-5 text-gray-500 mr-2" />
									<span className="font-medium">{friend.username}</span>
								</div>
								<LastSeen user={friend} />
							</div>

							<div className="flex justify-end">
								<Link to={`/private-chat/${friend._id}`}>
									<Button>
										<MessageCircleIcon />
										Open Chat
									</Button>
								</Link>
							</div>
						</div>
					))}
				</div>
			</InfiniteScroll>
		</div>
	);
}
