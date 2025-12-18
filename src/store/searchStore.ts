import { create } from "zustand";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export interface SearchUser {
	_id: string;
	username: string;
	isFollowing: boolean;
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

	search: (payload: SearchPayload) => Promise<void>;
	clearSearchState: () => void;
	updateUserFollowStatus: (_id: string, newFollowStatus: boolean) => void;
	toggleUserFollowStatus: (_id: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
	result: emptyResult,
	error: null,
	loading: false,

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
				error: err.response?.data?.message ?? 'Failed to request code',
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
	} 
}))