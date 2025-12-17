import { SignupForm } from "@/components/signup-form"
import UsernameForm from "@/components/username-form";
import VerifyForm from "@/components/verify-form";
import { useAuthStore } from "@/store/authStore"
import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
	const { email, accessToken, user, refreshToken } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (accessToken && user && user.username) {
			navigate('/');
		}
	}, [navigate, accessToken, user]);

	useEffect(() => {
		if (!accessToken && !user) {
			refreshToken();
		}
	}, [accessToken, user, refreshToken])

	let formToRender: JSX.Element | null = null;

  if (email && !user) {
    // If email exists but user is not yet created -> verify form
    formToRender = <VerifyForm />;
  } else if (!email) {
    // If email not available -> signup form
    formToRender = <SignupForm />;
  } else if (email && user && !user.username) {
    // Email exists, user exists, but username missing -> username form
    formToRender = <UsernameForm />;
  }

	return (
		<div className="w-full flex justify-center h-fit mt-20">
			<div className="max-w-5xl px-4">
				{formToRender}
			</div>
		</div>
	)
}

export default AuthPage
