import { useState, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { User, Users, UserPlus, Pencil, type LucideProps } from "lucide-react";
import FollowersList from "@/components/FollowersList";
import FollowingList from "@/components/FollowingList";
import FriendsList from "@/components/FriendsList";
import { useAuthStore } from "@/store/authStore";
import UsernameForm from "@/components/username-form";

type Tab = "followers" | "following" | "friends" | "update username";
type TabItem = {
	name: Tab;
	icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}
function Homepage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("followers");

	const tabs: TabItem[] = [
		{ name: "followers", icon: UserPlus },
		{ name: "following", icon: Users },
		{ name: "friends", icon: User },
    { name: "update username", icon: Pencil },
	];

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-center mt-4 mb-6">
        Welcome, {user?.username}
      </h1>

      {/* Secondary Navbar */}
      <div className="flex lg:overflow-x-hidden lg:justify-center overflow-x-scroll space-x-4 border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
					<button
						onClick={() => setActiveTab(tab.name)}
						className={`flex items-center gap-1 px-4 py-2 rounded-t-lg font-medium ${
							activeTab === tab.name ? "bg-card shadow-md" : "text-muted-foreground hover:text-gray-700"
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

export default Homepage;
