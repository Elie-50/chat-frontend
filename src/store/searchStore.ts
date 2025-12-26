import { create } from "zustand";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export interface SearchUser {
	_id: string;
	username: string;
	isFollowing: boolean;
}

type Friend = Omit<SearchUser, 'isFollowing'>;

export interface FriendsResult {
	totalFriends: number;
	totalPages: number;
	currentPage: number;
	friends: Friend[];
}

interface Result {
	data: SearchUser[];
	page: number;
	size: number;
	total: number;
	totalPages: number;
}

const emptyResult: Result = {
	data: [],
	page: 1,
	size: 10,
	total: 0,
	totalPages: 0,
};

interface SearchPayload {
	username: string;
	page: number;
	size: number;
}

interface SearchState {
	result: Result;
	error: string | null;
	loading: boolean;
	user: Friend | null;
	friendsSearch: FriendsResult,

	search: (payload: SearchPayload) => Promise<void>;
	setUser: (payload: Friend | null) => void;
	clearSearchState: () => void;
	findUser: (_id: string) => void;
	updateUserFollowStatus: (_id: string, newFollowStatus: boolean) => void;
	toggleUserFollowStatus: (_id: string) => void;
	fetchFriends: (payload: { size: number, page: number }) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set) => ({
	result: emptyResult,
	error: null,
	loading: false,
	user: null,
	friendsSearch: {
		totalFriends: 0,
		totalPages: 0,
		currentPage: 1,
		friends: []
	},

	setUser: (payload) => {
		set({ user: payload });
	},

	search: async (payload: SearchPayload) => {
		try {
			set({ loading: true, error: null });

			const res = await api.get<Result>('/users/search', {
				params: payload,
			});

			const data = res.data;

			set({ loading: false, error: null, result: data });
		} catch (error) {
			const err = error as AxiosError<{ message?: string }>
			
			set({
				loading: false,
				error: err.response?.data?.message ?? 'Failed to find users',
			})
		}
	},

	findUser: async (_id: string) => {
		try {
			set({ loading: true, error: null })

			const res = await api.get<Friend>(`/users/${_id}`);

			set({ user: res.data, loading: false });
		} catch (error) {
			const err = error as AxiosError<{ message?: string }>
			
			set({
				loading: false,
				error: err.response?.data?.message ?? 'Failed to find user',
			})
		}
	},

	clearSearchState: () => {
		set({
			result: emptyResult,
			loading: false,
			error: null,
		})
	},

	updateUserFollowStatus: (_id: string, newFollowStatus: boolean) => {
		set((state) => ({
			result: {
				...state.result,
				data: state.result.data.map((user) =>
					user._id === _id
						? { ...user, isFollowing: newFollowStatus }
						: user
				),
			},
		}));
	},

	toggleUserFollowStatus: (_id: string) => {
		set((state) => ({
			result: {
				...state.result,
				data: state.result.data.map((user) =>
					user._id === _id
						? { ...user, isFollowing: !user.isFollowing }
						: user
				),
			},
		}));
	},

	fetchFriends: async (payload = { page: 1, size: 20 }) => {
		try {
			set({ loading: false, error: null });
			const res = await api.get<FriendsResult>('/follow/me/friends', {
				params: payload,
			});

			set({ loading: false, friendsSearch: res.data });

		} catch (error) {
			const err = error as AxiosError<{ message: string }>;
			set({ error: err.message, loading: false });
		}
	},
}))