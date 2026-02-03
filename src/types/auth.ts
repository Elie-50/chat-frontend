export interface RequestCodePayload {
	email: string;
}

export interface VerifyPayload {
	email: string;
	code: string;
}

export interface UpdatePayload {
	username: string;
}

export interface User {
	_id: string;
	username: string;
}

export interface AuthResponse {
	accessToken: string;
	user: User;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface SignUpPayload {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}
