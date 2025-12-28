import { create } from 'zustand';
import { Socket } from 'socket.io-client';

export interface Message {
  _id: string;
  content: string;
  sender: string;
  modification?: string;
  conversation?: { _id: string };
  createdAt: string;
  reply?: {
    _id: string;
    sender: {
      _id: string;
      username: string;
    };
    content: string;
    modification?: string;
  }
}

export type TypingUser = {
	_id: string;
	username: string;
	isTyping: false;
}

export type CurrentlyTyping = Omit<TypingUser, 'isTyping'>;

export interface ResultPagination {
  data: Message[];
  page: number;
  totalPages: number;
  size: number;
  total: number;
}

interface ChatStore {
  messages: Message[];
  newMessage: string;
  socket: Socket | null;
  totalPages: number;
	page: number;
  reply: Message | null | undefined;
	currentlyTyping: Omit<TypingUser, 'isTyping'>[];
	selectedMessage: Message | null;

	setSelectedMessage: (message: Message | null) => void;
  setReply: (message: Message | null | undefined) => void;
  setTotalPages: (tp: number) => void;
	setPage: (n: number) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[]), prepend?: boolean) => void;
  clearPreviousMessages: () => void;
  setNewMessage: (message: string) => void;
  handleSend: (id: string, eventName: string) => void;
  handleDelete: (messageId: string, eventName: string) => void;
  handleUpdate: (messageId: string, content: string, eventName: string) => void;
  setSocket: (socket: Socket | null) => void;
  clearNewMessage: () => void;

	updateCurrentlyTyping: (payload: TypingUser) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  newMessage: '',
  socket: null,
  totalPages: 0,
  reply: undefined,
	currentlyTyping: [],
	page: 0,
	selectedMessage: null,

  setReply: (message) => {
    set({ reply: message });
  },

	setSelectedMessage: (message) => {
		set({ selectedMessage: message })
	},
  setTotalPages: (tp) => {
    set({ totalPages: tp });
  },

	setPage: (n) => {
    set({ page: n });
  },
  
  setMessages: (messages, prepend = false) => set((state) => {
    const current = state.messages;
		const incoming = typeof messages === "function" ? messages(current) : messages;

		const map = new Map(current.map((msg) => [msg._id, msg]));

		for (const msg of incoming) {
			map.set(msg._id, msg);
		}

		const uniqueMessages = prepend 
			? [...incoming, ...Array.from(map.values()).filter((m) => !incoming.some((i) => i._id === m._id))]
			: [...Array.from(map.values())];

		return { messages: uniqueMessages };
  }),

  clearPreviousMessages: () => {
    set({ messages: [] });
  },

  setNewMessage: (newMessage) => set({ newMessage }),
  clearNewMessage: () => set({ newMessage: '' }),
  
  setSocket: (socket) => set({ socket }),
  
  handleSend: (id, eventName) => {
    const { socket, newMessage, clearNewMessage, reply, setReply } = get();
    if (!socket || !newMessage.trim()) return;
    console.log(reply?._id);

    // Send the message through the socket
    socket.emit(eventName, {
      id,
      content: newMessage,
      repliedTo: reply?._id,
    });

    clearNewMessage();
    setReply(undefined);
  },

  handleDelete: (messageId: string, eventName) => {
    const { socket } = get();

    if (!socket) return;
    socket.emit(eventName, {
      messageId,
    });
  },
  handleUpdate: (messageId: string, content: string, eventName) => {
    const { socket, clearNewMessage } = get();
    if (!socket || !content.trim()) return;

    // Send the message through the socket
    socket.emit(eventName, {
      messageId,
      content,
    });

    clearNewMessage();
  },

	updateCurrentlyTyping: (payload) => {
		const { currentlyTyping } = get()
		if (!payload.isTyping) {
			set((state) => ({
				currentlyTyping: state.currentlyTyping.filter((t) => t._id !== payload._id),
			}))
		} else {
			if (currentlyTyping.some((t) => t._id == payload._id)) {
				return;
			}
			set((state) => ({
				currentlyTyping: [
					{ _id: payload._id, username: payload.username },
					...state.currentlyTyping, 
				],
			}))
		}
	},
}));
