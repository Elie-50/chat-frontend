import { useAuthStore } from "@/store/authStore"

function Homepage() {
	const { user } = useAuthStore();

	return (
		<div>
			<h1 className="text-2xl text-center mt-2">
				Welcome, {user?.username}
			</h1>
		</div>
	)
}

export default Homepage
