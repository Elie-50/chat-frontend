/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, type Message, type ResultPagination, type TypingUser } from '@/store/chatStore';
import { useSearchStore } from '@/store/searchStore';
import { BACKEND_URL } from '@/lib/api';
import Chat from './ChatComponent';
import { useDebounce } from 'use-debounce';

const messageAudio = new Audio('/sounds/live-chat.mp3');

interface PrivateChatProps {
  recipientId: string;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ recipientId }) => {
  const { accessToken, user } = useAuthStore();
  const { user: recipient, findUser, setUser } = useSearchStore();
  const { 
    messages, 
    newMessage, 
    setNewMessage, 
    handleSend, 
    setMessages, 
    setSocket,
		socket,
    handleDelete,
    handleUpdate,
    clearPreviousMessages,
    totalPages,
		page,
		setPage,
		updateCurrentlyTyping,
  } = useChatStore();
  
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
	const [debouncedMessage] = useDebounce(newMessage, 300);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const size = 20;

	const isTypingRef = useRef(false);

	useEffect(() => {
		if (!accessToken || socket) return;

    const newSocket = io(BACKEND_URL + '/private-chat', {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token: accessToken },
    });
    setSocket(newSocket);
		setPage(1);

		newSocket.emit('connect:user', { recipientId });
	}, [accessToken, recipientId]);

	// start typing
	useEffect(() => {
		if (!socket || !recipientId) {
			return;
		}
		const hasText = newMessage.length > 0;
		if (hasText && !isTypingRef.current) {
			socket.emit("typing:start", { recipientId });
			isTypingRef.current = true;
		}
		
		if (!hasText && isTypingRef.current) {
			socket.emit("typing:stop", { recipientId });
			isTypingRef.current = false; 
		}
	}, [newMessage, recipientId, socket]);

	// Stop typing when debounce settles
	useEffect(() => {
		if (!socket || !recipientId) {
			return;
		}
		const hasText = newMessage.length > 0;
		const debounceSettled = debouncedMessage === newMessage;
		if (isTypingRef.current && (!hasText || debounceSettled)) {
			socket.emit("typing:stop", { recipientId });
			isTypingRef.current = false;
		}
	}, [debouncedMessage, newMessage, recipientId, socket]);

  useEffect(() => {
    clearPreviousMessages();
  }, [])

  useEffect(() => {
    if (accessToken) {
      findUser(recipientId);
    }

    return () => {
      setUser(null);
    }
  }, [recipientId, accessToken]);

  useEffect(() => {
    if (!socket) return;

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

		socket.on('typing:update', (data: TypingUser) => {
			updateCurrentlyTyping(data);
		});

    socket.on('error:private-message', (err: { message: string }) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [recipientId, accessToken, socket]);

	useEffect(() => {
		if (socket) {
			socket.emit('find:private-messages', { recipientId, page: 1, size: 20 });
		}
	}, [socket]);

	useEffect(() => {
		console.log("I ran");
		if (!socket) return;
		// Listen for messages
    socket.on('conversation-messages', (data: ResultPagination) => {
      setMessages(data.data, true);
    });
	}, [socket])

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

		if (socket) {
			socket.emit('find:private-messages', { recipientId, page, size })
		}
  };

  return (
    <Chat 
      _id={recipientId}
      title={recipient?.username || 'Private chat'}
			recipient={recipient}
      loadEarlierMessages={loadEarlierMessages}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      messages={messages}
      page={page}
      totalPages={totalPages}
      handleSend={sendMessage}
      handleDialogClose={handleDialogClose}
      handleUpdate={updateMessage}
      handleUpdateClicked={handleUpdatingClicked}
      updatingMessageId={updatingMessageId}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
      handleDialogSubmit={handleDialogSubmit}
      deleteMessage={deleteMessage}
    />
  );
};

export default PrivateChat;
