import { useAuthStore } from "@/store/authStore"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
	const { user, accessToken, refreshToken, error } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!accessToken && !user) {
			refreshToken();
		}
	}, [accessToken, user, refreshToken]);

	useEffect(() => {
		if (error) {
			navigate('/auth');
		}
	}, [error, navigate]);

	return (
		<div>
			Welcome
		</div>
	)
}

export default Homepage
