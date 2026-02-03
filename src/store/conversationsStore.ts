import { create } from "zustand";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

interface SearchData {
	_id: string;
	name: string;
	type: "group" | "dm";
	updatedAt: string;
}

interface SearchResponse {
	data: SearchData[];
	total: number;
	page: number;
	limit: number;
}

interface SearchPayload {
	filter: "all" | "groups" | "dms";
	page: number;
	limit: number;
}

interface ConversationState {
	loading: boolean;
	error: string | null;

	selectedConversationId?: string;
	conversations: SearchData[];
	totalConversations: number;

	searchConversations: (payload: SearchPayload) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set) => ({
	loading: false,
	error: null,

	selectedConversationId: undefined,
	conversations: [],
	totalConversations: 0,

	searchConversations: async (payload) => {
		try {
			set({ loading: true, error: null });

			const res = await api.get<SearchResponse>("/conversations", {
				params: payload,
			});

			const data = res.data;

			set({
				loading: false,
				error: null,
				conversations: data.data,
				totalConversations: data.total,
			});
		} catch (error: unknown) {
			const err = error as AxiosError<{ message?: string }>;

			set({ loading: false, error: err.message });
		}
	},
}));
