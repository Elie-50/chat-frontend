import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Notifications from "./Notifications";
import OnlineStateTracker from "./OnlineStateTracker";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

export const Navbar = () => {
	const [theme] = useState<Theme>(
		(localStorage.getItem("theme") as Theme) || "dark",
	);
	const isMobile = useIsMobile();

	const { user, accessToken, refreshToken, error, accessTokenExpiresAt } =
		useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		const refreshInterval = setInterval(() => {
			if (
				accessToken &&
				accessTokenExpiresAt &&
				Date.now() > accessTokenExpiresAt - 1 * 60 * 1000
			) {
				refreshToken();
			}
		}, 30000);

		return () => clearInterval(refreshInterval);
	}, [accessToken, accessTokenExpiresAt, refreshToken]);

	useEffect(() => {
		if (!accessToken && !user) {
			refreshToken();
		}
	}, [accessToken, user, refreshToken]);

	useEffect(() => {
		if (
			error &&
			error == "Invalid refresh token" &&
			window.location.pathname != "/sign-up" &&
			window.location.pathname != "/login"
		) {
			navigate("/login");
		}
	}, [error, navigate]);

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove(theme === "light" ? "dark" : "light");
		root.classList.add(theme);
	}, [theme]);

	return (
		<nav
			className={cn(
				"w-full fixed top-0 left-0 z-50 border-b border-border bg-card",
				isMobile && "hidden",
			)}
		>
			<div className="mx-auto px-4 py-2 flex items-center justify-between">
				{/* Left: App name + links */}
				<div className="flex items-center gap-6">
					<Link
						to="/"
						className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
					>
						WhatsKenoun
					</Link>

					<Link to="/search" className="nav-link">
						Search
					</Link>
					<Link to="/chats" className="nav-link">
						Chats
					</Link>
					<Link to="/profile" className="nav-link">
						Profile
					</Link>
				</div>

				{/* Right: Theme toggle */}
				<div>
					<Notifications />
					<OnlineStateTracker />
				</div>
			</div>
		</nav>
	);
};
