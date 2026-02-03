import { Home, Search, MessageCircle, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export function TabBar() {
	const { accessToken } = useAuthStore();
	return (
		<nav
			className={cn(
				"fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden",
				accessToken == null && "hidden",
			)}
		>
			<div className="flex h-16 items-center justify-around">
				<TabBarLink to="/" label="Home" icon={<Home className="h-5 w-5" />} />
				<TabBarLink
					to="/search"
					label="Search"
					icon={<Search className="h-5 w-5" />}
				/>
				<TabBarLink
					to="/chats"
					label="Chats"
					icon={<MessageCircle className="h-5 w-5" />}
				/>
				<TabBarLink
					to="/profile"
					label="Profile"
					icon={<User className="h-5 w-5" />}
				/>
			</div>
		</nav>
	);
}

interface TabBarLinkProps {
	to: string;
	label: string;
	icon: React.ReactNode;
}

export function TabBarLink({ to, label, icon }: TabBarLinkProps) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				cn(
					"flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors",
					isActive
						? "text-primary"
						: "text-muted-foreground hover:text-foreground",
				)
			}
		>
			{icon}
			<span>{label}</span>
		</NavLink>
	);
}
