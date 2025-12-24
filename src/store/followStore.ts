import { create } from "zustand";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";
import { useSearchStore } from "./searchStore";

interface Follow {
	_id: string;
	username: string;
	isFollowing?: boolean;
}

interface PaginatedResult {
	data: Follow[];
	page: number;
	size: number;
	total: number;
	totalPages: number;
}

const emptyResult: PaginatedResult = {
	data: [],
	page: 1,
	size: 10,
	total: 0,
	totalPages: 1
}

interface Payload {
	page: number;
	size: number;
}

interface FollowState {
	loading: boolean;
	error: string | null;
	followingResult: PaginatedResult;
	followersResult: PaginatedResult;

	followUser: (_id: string) => Promise<void>;
	unfollowUser: (_id: string) => Promise<void>;
	getFollowing: (payload: Payload) => Promise<void>;
	getFollowers: (payload: Payload) => Promise<void>;
}

export const useFollowStore = create<FollowState>((set) => ({
	loading: false,
	error: null,
	followingResult: emptyResult,
	followersResult: emptyResult,
	
	followUser: async (_id: string) => {
		try {
			set({ loading: true, error: null });

			await api.post<void>('/follow', { id: _id });

			useSearchStore.getState().toggleUserFollowStatus(_id);
			let newF: Follow;
			set((state) => ({
				loading: false,
				followersResult: {
					...state.followersResult,
					data: state.followersResult.data.map((f) => {
						if (f._id === _id) {
							newF = f;
						}
						return f._id === _id ? {
							...f,
							isFollowing: true
						} : f
					}
						
					),
				},
				followingResult: {
					...state.followingResult,
					data: [... state.followingResult.data, newF],
				},
			}))
		} catch (error) {
			const err = error as AxiosError<{ message?: string }>
			
			set({
				loading: false,
				error: err.response?.data?.message ?? 'Failed to follow user',
			})
		}
	},
	
	unfollowUser: async (_id: string) => {
		try {
			set({ loading: true, error: null });

			await api.delete<void>(`/follow/${_id}`);

			useSearchStore.getState().toggleUserFollowStatus(_id);
			set((state) => ({
				loading: false,
				followingResult: {
					...state.followingResult,
					data: state.followingResult.data.filter((f) => f._id != _id)
				},
				followersResult: {
					...state.followersResult,
					data: state.followersResult.data.map((f) => 
						f._id === _id ? {
							...f,
							isFollowing: false
						} : f
					),
				},
			}))
		} catch (error) {
			const err = error as AxiosError<{ message?: string }>
			
			set({
				loading: false,
				error: err.response?.data?.message ?? 'Failed to unfollow user',
			})
		}
	},

	getFollowers: async (payload) => {
		try {
			set({ loading: true, error: null });

			const res = await api.get<PaginatedResult>('/follow/me/followers', {
				params: payload,
			});

			set({ loading: false, followersResult: res.data });
		} catch (error) {
			const err = error as AxiosError<{ message: string }>;
			set({ loading: false, error: err.message });
		}
	},

	getFollowing: async (payload) => {
		try {
			set({ loading: true, error: null });

			const res = await api.get<PaginatedResult>('/follow/me/following', {
				params: payload,
			});

			set({ loading: false, followingResult: res.data });
		} catch (error) {
			const err = error as AxiosError<{ message: string }>;
			set({ loading: false, error: err.message });
		}
	},
}));