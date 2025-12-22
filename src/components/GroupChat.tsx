import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { BACKEND_URL } from '@/lib/api';
import { useChatStore, type Message } from '@/store/chatStore';
import Chat from './ChatComponent';

interface GroupChatProps {
  conversationId: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ conversationId }) => {
  const { accessToken, user } = useAuthStore();
  const { 
    messages, 
    newMessage, 
    setNewMessage, 
    handleSend, 
    setMessages, 
    setSocket, 
    handleDelete,
    handleUpdate,
  } = useChatStore();

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const size = 20;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(BACKEND_URL + '/group-chat', {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token: accessToken },
    });

    socketRef.current = socket;
    setSocket(socket);

		if (user && user._id) {
			// Fetch existing messages
			socket.emit('find:group-messages', { senderId: user?._id, conversationId, page: page, size });
		}

    // Listen for messages
    socket.on('group-messages:found', (data: { data: Message[] }) => {
			console.log(data);
      if (page === 1) {
        // If it's the first page, reset the messages
        setMessages(data.data);
      } else {
        // Otherwise, prepend the messages
        setMessages(data.data, true);
      }
    });

    // Listen for incoming new messages
    socket.on('group-message:received', (data: { message: Message }) => {
      setMessages((prev) => [...prev, data.message]);
    });

    socket.on('group-message:removed', (data: { message: Message }) => {
			console.log(data);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.message._id ? { 
            ...msg,
            content: '',
            modification: data.message.modification,
          } : msg
        )
      );
    });

    socket.on('group-message:updated', (data: { message: Message }) => {
			console.log(data);
      // Update the message content based on the provided messageId
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.message._id ? { 
            ...msg,
            content: data.message.content,
            modification: data.message.modification,
          } : msg
        )
      );
    });

    socket.on('error:group-message', (err: { message: string }) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, setSocket, setMessages, page, user, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!newMessage.trim()) return;

      if (updatingMessageId) {
        handleUpdate(updatingMessageId, newMessage, 'update:group-message');
      } else {
        handleSend(conversationId, 'send:group-message');
      }
    }
  };

  const sendMessage = (id: string) => {
    handleSend(id, 'send:group-message');
  }

  const updateMessage = (id: string, newValue: string) => {
    handleUpdate(id, newValue, 'update:group-message');
  }

  const handleUpdatingClicked = (_id: string) => {
    setUpdatingMessageId(_id);
    const messageToUpdate = messages.find((msg) => msg._id === _id);
    if (messageToUpdate) {
      setNewMessage(messageToUpdate.content);
      setIsDialogOpen(true);
    }
  };

  const deleteMessage = (_id: string) => {
    handleDelete(_id, 'remove:group-message');
  };

  const handleDialogSubmit = () => {
    if (newMessage.trim() && updatingMessageId) {
      handleUpdate(updatingMessageId, newMessage, 'update:group-message');
      setUpdatingMessageId(null);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = () => {
    setNewMessage('');
    setUpdatingMessageId(null);
    setIsDialogOpen(false);
  };

  const loadEarlierMessages = () => {
    const nextPage = page + 1;
    setPage(nextPage);
  };

  return (
    <Chat 
      _id={conversationId}
      title='Group Chat'
      loadEarlierMessages={loadEarlierMessages}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      messages={messages}
      handleKeyDown={handleKeyDown}
      handleSend={sendMessage}
      handleDialogClose={handleDialogClose}
      handleUpdate={updateMessage}
      handleUpdateClicked={handleUpdatingClicked}
      updatingMessageId={updatingMessageId}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
      handleDialogSubmit={handleDialogSubmit}
      deleteMessage={deleteMessage}
      messagesEndRef={messagesEndRef}
    />  
  );
};

export default GroupChat;
