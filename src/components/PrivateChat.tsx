import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, type Message } from '@/store/chatStore';
import ChatBubble from './ChatBubble';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, Send } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { BACKEND_URL } from '@/lib/api';

interface PrivateChatProps {
  recipientId: string;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ recipientId }) => {
  const { accessToken } = useAuthStore();
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
  }, [recipientId, accessToken, setSocket, setMessages, page]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!newMessage.trim()) return;

      if (updatingMessageId) {
        handleUpdate(updatingMessageId, newMessage);
      } else {
        handleSend(recipientId);
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

  const deleteMessage = (_id: string) => {
    handleDelete(_id);
  };

  const handleDialogSubmit = () => {
    if (newMessage.trim() && updatingMessageId) {
      handleUpdate(updatingMessageId, newMessage);
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
    <div className="flex flex-col w-full max-w-5xl mx-auto shadow-md rounded-lg p-4 mt-2 bg-card h-auto sm:h-125 md:h-150">
      {/* Fixed Header */}
      <div className="flex justify-center items-center sticky top-0 bg-card z-10 p-4 shadow-md rounded-lg">
        <h2 className="text-lg font-semibold text-foreground text-center">
          <span>{recipient?.username}</span>
        </h2>
      </div>

      <div className="flex justify-center my-4">
        <Button
          onClick={loadEarlierMessages}
          className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-full"
        >
          Load Earlier Messages
        </Button>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto mb-4 pt-4">
        {messages.map((msg) => (
          <ChatBubble key={msg._id} message={msg} handleUpdate={handleUpdatingClicked} handleDelete={deleteMessage} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="flex">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={() => {
            if (!newMessage.trim()) return;

            if (updatingMessageId) {
              handleUpdate(updatingMessageId, newMessage);
            } else {
              handleSend(recipientId);
            }
          }}
          variant="secondary"
          className="bg-chart-1 text-foreground hover:bg-chart-1/80 px-4 py-2 rounded-full ml-2"
        >
          {newMessage.length > 0 ? (
            <Send className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Update Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Message</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Edit your message..."
            className="w-full"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleDialogSubmit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivateChat;
