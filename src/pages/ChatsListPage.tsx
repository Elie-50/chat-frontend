import { useState, useRef, useEffect } from "react";
import { User, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useConversationStore } from "@/store/conversationsStore";

type ChatType = "dms" | "groups";

export default function ChatsListPage() {
	const navigate = useNavigate();
	const [filter, setFilter] = useState<"all" | ChatType>("all");
	const [page] = useState<number>(1);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const { conversations, searchConversations } = useConversationStore();
	const { accessToken } = useAuthStore();

	const handleFilterClick = (type: "all" | ChatType) => {
		if (filter === type && type !== "all") {
			setFilter("all");
		} else {
			setFilter(type);
		}
	};

	// Infinite scroll placeholder
	useEffect(() => {
		const handleScroll = () => {
			if (!containerRef.current) return;
			const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
			if (scrollTop + clientHeight >= scrollHeight - 10) {
				console.log("Reached bottom! Load more data here...");
			}
		};

		const container = containerRef.current;
		container?.addEventListener("scroll", handleScroll);
		return () => container?.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (accessToken) {
			searchConversations({ page, limit: 20, filter });
		}
	}, [filter, searchConversations, accessToken, page]);

	return (
		<div className="flex flex-col h-screen bg-background">
			{/* Header */}
			<header className="px-6 py-4 border-b border-border bg-background">
				<h1 className="text-2xl font-bold text-foreground text-center">
					Chats
				</h1>
			</header>

			{/* Navbar */}
			<div className="flex justify-center gap-4 px-4 py-3 border-b border-border bg-background">
				{["all", "groups", "dms"].map((type) => {
					const label =
						type === "all" ? "All" : type === "groups" ? "Groups" : "Private";
					const isActive = filter === type;
					return (
						<Button
							key={type}
							variant={isActive ? "default" : "outline"}
							size="sm"
							onClick={() => handleFilterClick(type as ChatType)}
							className="rounded-full px-4 py-2"
						>
							{label}
						</Button>
					);
				})}
			</div>

			{/* Chat list */}
			<ScrollArea className="flex-1 p-4 mt-2 mb-20">
				<div ref={containerRef} className="space-y-3">
					{conversations.map((chat) => (
						<Card
							key={chat._id}
							className="p-4 flex flex-row items-center gap-3 hover:shadow-md cursor-pointer"
						>
							{/* Icon to the left */}
							<div className="shrink-0">
								{chat.type === "dm" ? (
									<User className="w-6 h-6 text-primary" />
								) : (
									<Users className="w-6 h-6 text-primary" />
								)}
							</div>

							{/* Chat info */}
							<div className="flex-1 flex flex-col">
								<span className="font-medium text-foreground">{chat.name}</span>
								<span className="text-sm text-muted-foreground">
									{new Date(chat.updatedAt).toLocaleString()}
								</span>
							</div>

							{/* Type label */}
							<span className="text-sm text-muted-foreground">
								{chat.type === "dm" ? "DM" : "Group"}
							</span>
						</Card>
					))}
				</div>
			</ScrollArea>

			{/* FAB */}
			<Button
				size="icon"
				className="fixed bottom-20 lg:bottom-6 right-6 bg-primary text-primary-foreground shadow-lg hover:bg-primary/80 rounded-full"
				onClick={() => navigate("/groups/new")}
			>
				<Plus className="w-6 h-6" />
			</Button>
		</div>
	);
}
