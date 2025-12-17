export interface RequestCodePayload {
  email: string;
};

export interface VerifyPayload {
  email: string;
  code: string;
};

export interface UpdatePayload {
  username: string;
};

export interface User {
  _id: string;
  email: string;
	username?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
};
