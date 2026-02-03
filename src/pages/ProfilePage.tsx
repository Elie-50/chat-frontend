import {
	useEffect,
	useState,
	type ForwardRefExoticComponent,
	type RefAttributes,
} from "react";
import {
	User,
	Users,
	UserPlus,
	Pencil,
	Sun,
	Moon,
	LogOut,
	type LucideProps,
} from "lucide-react";
import FollowersList from "@/components/FollowersList";
import FollowingList from "@/components/FollowingList";
import FriendsList from "@/components/FriendsList";
import UsernameForm from "@/components/username-form";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

type Tab = "followers" | "following" | "friends" | "update username";

type TabItem = {
	name: Tab;
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
	>;
};

type Theme = "light" | "dark";

function ProfilePage() {
	const { user, logout, error } = useAuthStore();
	const [activeTab, setActiveTab] = useState<Tab>("followers");
	const navigate = useNavigate();

	const tabs: TabItem[] = [
		{ name: "followers", icon: UserPlus },
		{ name: "following", icon: Users },
		{ name: "friends", icon: User },
		{ name: "update username", icon: Pencil },
	];

	const [theme, setTheme] = useState<Theme>(
		(localStorage.getItem("theme") as Theme) || "dark",
	);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
	};

	const handleLogout = async () => {
		await logout();

		if (!error) {
			navigate("/login");
		}
	};

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove(theme === "light" ? "dark" : "light");
		root.classList.add(theme);
	}, [theme]);

	return (
		<div className="max-w-5xl mx-auto px-4">
			{/* Header */}
			<div className="flex items-center justify-between mt-4 mb-6">
				<h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>

				{/* Actions */}
				<div className="flex items-center gap-2">
					{/* Theme toggle */}
					<button
						aria-label="Toggle theme"
						onClick={toggleTheme}
						className="p-2 rounded-full hover:bg-muted transition"
					>
						{theme === "dark" ? (
							<Sun className="w-5 h-5" />
						) : (
							<Moon className="w-5 h-5" />
						)}
					</button>

					{/* Logout */}
					<button
						aria-label="Logout"
						onClick={handleLogout}
						className="p-2 rounded-full text-destructive hover:bg-destructive/10 transition"
					>
						<LogOut className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex overflow-x-auto lg:overflow-x-hidden lg:justify-center gap-2 border-b mb-4">
				{tabs.map((tab) => (
					<button
						key={tab.name}
						onClick={() => setActiveTab(tab.name)}
						className={`flex items-center gap-1 px-4 py-2 rounded-t-lg font-medium transition ${
							activeTab === tab.name
								? "bg-card shadow-md"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<tab.icon className="w-4 h-4" />
						<span className="capitalize">{tab.name}</span>
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className="bg-card shadow-md rounded-b-lg p-4 min-h-75">
				{activeTab === "followers" && <FollowersList />}
				{activeTab === "following" && <FollowingList />}
				{activeTab === "friends" && <FriendsList />}
				{activeTab === "update username" && <UsernameForm />}
			</div>
		</div>
	);
}

export default ProfilePage;
