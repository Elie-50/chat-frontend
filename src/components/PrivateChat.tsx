import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, type Message } from '@/store/chatStore';
import { useSearchStore } from '@/store/searchStore';
import { BACKEND_URL } from '@/lib/api';
import Chat from './ChatComponent';

const messageAudio = new Audio('/sounds/live-chat.mp3');

interface PrivateChatProps {
  recipientId: string;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ recipientId }) => {
  const { accessToken, user } = useAuthStore();
  const { user: recipient, findUser } = useSearchStore();
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
    if (accessToken) {
      findUser(recipientId);
    }
  }, [recipientId, findUser, accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(BACKEND_URL + '/private-chat', {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token: accessToken },
    });

    socketRef.current = socket;
    setSocket(socket);

    // Fetch existing messages
    socket.emit('find:private-messages', { recipientId, page: page, size });

    // Listen for messages
    socket.on('conversation-messages', (data: { data: Message[] }) => {
      if (page === 1) {
        // If it's the first page, reset the messages
        setMessages(data.data);
      } else {
        // Otherwise, prepend the messages
        setMessages(data.data, true);
      }
    });

    // Listen for incoming new messages
    socket.on('private-message:received', (data: { message: Message }) => {
      setMessages((prev) => [...prev, data.message]);

      if (data.message.sender != user?.username) {
        messageAudio.currentTime = 0;
        messageAudio.play().catch(() => {});
      }
    });

    socket.on('private-message:removed', (data: { messageId: string }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.messageId ? { 
            ...msg,
            content: '',
            modification: 'Deleted',
          } : msg
        )
      );
    });

    socket.on('private-message:updated', (data: { message: Message }) => {
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

    socket.on('error:private-message', (err: { message: string }) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [recipientId, accessToken, setSocket, setMessages, page, user]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!newMessage.trim()) return;

      if (updatingMessageId) {
        handleUpdate(updatingMessageId, newMessage, 'update:private-message');
      } else {
        handleSend(recipientId, 'send:private-message');
      }
    }
  };

  const handleUpdatingClicked = (_id: string) => {
    setUpdatingMessageId(_id);
    const messageToUpdate = messages.find((msg) => msg._id === _id);
    if (messageToUpdate) {
      setNewMessage(messageToUpdate.content);
      setIsDialogOpen(true);
    }
  };

  const sendMessage = (id: string) => {
    handleSend(id, 'send:private-message');
  }

  const updateMessage = (id: string, newValue: string) => {
    handleUpdate(id, newValue, 'update:private-message');
  }

  const deleteMessage = (_id: string) => {
  handleDelete(_id, 'remove:private-message');
  };

  const handleDialogSubmit = () => {
    if (newMessage.trim() && updatingMessageId) {
      handleUpdate(updatingMessageId, newMessage, 'update:private-message');
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
    socketRef.current?.emit('find:private-messages', {
      recipientId,
      page,
      size,
    });
  };

  return (
    <Chat 
      _id={recipientId}
      title={recipient?.username || 'Private chat'}
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

export default PrivateChat;
