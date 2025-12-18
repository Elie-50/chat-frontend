import { create } from "zustand";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";
import { useSearchStore } from "./searchStore";

interface FollowState {
	loading: boolean;
	error: string | null;

	followUser: (_id: string) => Promise<void>;
	unfollowUser: (_id: string) => Promise<void>;
}

export const useFollowStore = create<FollowState>((set) => ({
	loading: false,
	error: null,
	
	followUser: async (_id: string) => {
		try {
			set({ loading: true, error: null });

			await api.post<void>('/follow', { id: _id });

			useSearchStore.getState().toggleUserFollowStatus(_id);
			set({ loading: false });
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
			set({ loading: false });
		} catch (error) {
			const err = error as AxiosError<{ message?: string }>
			
			set({
				loading: false,
				error: err.response?.data?.message ?? 'Failed to unfollow user',
			})
		}
	},
}));