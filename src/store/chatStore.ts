import { create } from 'zustand';
import { Socket } from 'socket.io-client';

export interface Message {
  _id: string;
  content: string;
  sender: string;
  modification?: string;
  conversation?: { _id: string };
}

interface ChatStore {
  messages: Message[];
  newMessage: string;
  socket: Socket | null;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[]), prepend?: boolean) => void;
  setNewMessage: (message: string) => void;
  handleSend: (id: string, eventName: string) => void;
  handleDelete: (messageId: string, eventName: string) => void;
  handleUpdate: (messageId: string, content: string, eventName: string) => void;
  setSocket: (socket: Socket | null) => void;
  clearNewMessage: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  newMessage: '',
  socket: null,
  
  setMessages: (messages, prepend = false) => set((state) => {
    if (typeof messages === 'function') {
      // If the argument is a function, apply it to the previous state
      const updatedMessages = messages(state.messages);

      // Ensure no duplicates by checking `_id`
      const uniqueMessages = prepend
        ? [...updatedMessages, ...state.messages.filter((msg) => !updatedMessages.some((newMsg) => newMsg._id === msg._id))]
        : [...state.messages.filter((msg) => !updatedMessages.some((newMsg) => newMsg._id === msg._id)), ...updatedMessages];

      return { messages: uniqueMessages };
    } else {
      // If it's an array, just append/prepend directly, checking for duplicates
      const uniqueMessages = prepend
        ? [...messages, ...state.messages.filter((msg) => !messages.some((newMsg) => newMsg._id === msg._id))]
        : [...state.messages.filter((msg) => !messages.some((newMsg) => newMsg._id === msg._id)), ...messages];

      return { messages: uniqueMessages };
    }
  }),

  setNewMessage: (newMessage) => set({ newMessage }),
  clearNewMessage: () => set({ newMessage: '' }),
  
  setSocket: (socket) => set({ socket }),
  
  handleSend: (id, eventName) => {
    const { socket, newMessage, clearNewMessage } = get();
    if (!socket || !newMessage.trim()) return;

    // Send the message through the socket
    socket.emit(eventName, {
      id,
      content: newMessage,
    });

    clearNewMessage(); // Clear the new message input after sending
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
  }
}));
