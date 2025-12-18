import { useAuthStore } from "@/store/authStore"

function Homepage() {
	const { user } = useAuthStore();

	return (
		<div>
			Welcome, {user?.username}
		</div>
	)
}

export default Homepage
