/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { BACKEND_URL } from '@/lib/api';
import { useChatStore, type Message, type ResultPagination, type TypingUser } from '@/store/chatStore';
import Chat from './ChatComponent';
import { useGroupStore } from '@/store/groupStore';
import { useDebounce } from 'use-debounce';

const messageAudio = new Audio('/sounds/live-chat.mp3');

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
		socket,
    setSocket,
    handleDelete,
    handleUpdate,
    clearPreviousMessages,
    totalPages,
		page,
		setPage,
		updateCurrentlyTyping,
  } = useChatStore();
  const { findGroupData, selectedGroup, clearSelectedGroup } = useGroupStore();

  const [debouncedMessage] = useDebounce(newMessage, 300);
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
	const isTypingRef = useRef(false);
  const size = 20;

	useEffect(() => {
		if (!accessToken || socket) return;

    const newSocket = io(BACKEND_URL + '/group-chat', {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token: accessToken },
    });
    setSocket(newSocket);
		setPage(1);

		newSocket.emit('connect:user', { conversationId });
	}, [accessToken, conversationId]);

	// start typing
	useEffect(() => {
		if (!socket || !conversationId) {
			return;
		}
		const hasText = newMessage.length > 0;
		if (hasText && !isTypingRef.current) {
			socket.emit("typing:start", { conversationId });
			isTypingRef.current = true;
		}
		
		if (!hasText && isTypingRef.current) {
			socket.emit("typing:stop", { conversationId });
			isTypingRef.current = false; 
		}
	}, [newMessage, conversationId, socket]);

	// Stop typing when debounce settles
	useEffect(() => {
		if (!socket || !conversationId) {
			return;
		}
		const hasText = newMessage.length > 0;
		const debounceSettled = debouncedMessage === newMessage;
		if (isTypingRef.current && (!hasText || debounceSettled)) {
			socket.emit("typing:stop", { conversationId });
			isTypingRef.current = false;
		}
	}, [debouncedMessage, newMessage, conversationId, socket]);


  useEffect(() => {
    clearPreviousMessages();
  }, [clearPreviousMessages]);

  useEffect(() => {
    if (accessToken && conversationId) {
      findGroupData(conversationId)
    }

    return () => {
      clearSelectedGroup();
    }
  }, [accessToken, findGroupData, conversationId, clearSelectedGroup])

  useEffect(() => {
		if (!socket) return;

    // Listen for incoming new messages
    socket.on('group-message:received', (data: { message: Message }) => {
      setMessages((prev) => [...prev, data.message]);

      if (data.message.sender != user?.username) {
        messageAudio.currentTime = 0;
        messageAudio.play().catch(() => {});
      }
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

		socket.on('typing:update', (data: TypingUser) => {
			console.log(data);
			updateCurrentlyTyping(data);
		});

    socket.on('error:group-message', (err: { message: string }) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, conversationId, socket]);

	useEffect(() => {
		if (user && user._id && socket) {
			// Fetch existing messages
			socket.emit('find:group-messages', { senderId: user?._id, conversationId, page: page, size });
		}
	}, [socket, user, conversationId, page]);

	useEffect(() => {
		if (!socket) return;
		 // Listen for messages
    socket.on('group-messages:found', (data: ResultPagination) => {
			setMessages(data.data, true);
    });
	}, [socket])

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
      title={selectedGroup?.name || 'Group Chat'}
      admin={selectedGroup?.admin}
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

export default GroupChat;
