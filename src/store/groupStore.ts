import { create } from "zustand";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

export interface Group {
	_id: string;
	name: string;
	admin: string;
	participants: string[];
}

interface SearchGroupsPayload {
	size: number;
	page: number;
}

export interface GroupSearch {
	data: Group[];
	total: number;
	page: number;
	size: number;
	totalPages: number;
}

interface GroupState {
	loading: boolean;
	error: string | null;
	groups: GroupSearch | null;
	selectedIndex: number;

	fetchGroups: (payload: SearchGroupsPayload) => Promise<void>;
	createGroup: (payload: { name: string }) => Promise<void>;
	updateGroup: (id: string, payload: { name: string }) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set) => ({
	loading: false,
	error: null,
	groups: null,
	selectedIndex: -1,

	fetchGroups: async (payload) => {
		try {
			set({ loading: true, error: null });

			const res = await api.get<GroupSearch>('/conversations', {
				params: payload
			});

			const data = res.data;

			set({
				loading: false,
				error: null,
				groups: data,
			});
		} catch (error: unknown) {
			const err = error as AxiosError<{ message?: string }>;

			set({ loading: false, error: err.message });
		}
	},

	createGroup: async (payload) => {
		try {
			set({ loading: true, error: null });

			const res = await api.post<Group>('/conversations', payload);
			const newGroup = res.data;

			set((state) => ({
				loading: false,
				groups: state.groups ? {
					...state.groups,
					data: [...state.groups.data, newGroup],
				} : null,
			}));
		} catch (error) {
			const err = error as AxiosError<{ message: string }>;

			set({ loading: false, error: err.message });
		}
	},

	updateGroup: async (id, payload) => {
		try {
			set({ loading: true, error: null });

			const res = await api.patch<Group>(`/conversations/${id}`, payload);

			const updatedGroup = res.data;

			set((state) => ({
				loading: false,
				groups: state.groups ? {
					...state.groups,
					data: state.groups.data.map((grp) => 
						grp._id == id
							? updatedGroup
							: grp
					),
				} : null,
			}));
			
		} catch (error) {
			const err = error as AxiosError<{ message: string }>;

			set({ loading: false, error: err.message });
		}
	}
}));
