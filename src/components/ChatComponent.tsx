import ChatBubble from './ChatBubble';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useChatStore, type Message } from '@/store/chatStore';
import { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import { cn } from '@/lib/utils';

interface ChatProps {
	_id: string,
  title: string;
  admin?: string;
	loadEarlierMessages: () => void;
	messages: Message[];
  page: number;
  totalPages: number;
	handleUpdateClicked: (messageId: string) => void;
	deleteMessage: (messageId: string) => void;
	newMessage: string;
	setNewMessage: (value: string) => void;
	updatingMessageId: string | null;
	handleUpdate: (messageId: string, newValue: string) => void;
	handleSend: (_id: string) => void;
	isDialogOpen: boolean,
	setIsDialogOpen: (open: boolean) => void;
	handleDialogSubmit: () => void;
	handleDialogClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ 
	_id,
	title,
  admin,
	loadEarlierMessages,
	messages,
	handleUpdateClicked,
	deleteMessage,
	newMessage,
	setNewMessage,
	updatingMessageId,
	handleUpdate,
	handleSend,
	isDialogOpen,
	setIsDialogOpen,
	handleDialogSubmit,
	handleDialogClose,
}) => {
  const { reply, setReply } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, reply]);
  
  const send = () => {
    if (!newMessage.trim()) return;

    if (updatingMessageId) {
      handleUpdate(updatingMessageId, newMessage);
    } else {
      handleSend(_id);
    }
  }

  const scrollMessageIntoView = (messageId: string) => {
    const messageElement = document.querySelector(`[data-id='${messageId}']`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const changeRepliedMessage = (message: Message | null) => {
    setReply(message);
  }

  return (
    <div className="flex flex-col w-full max-w-5xl min-h-[85vh] mx-auto shadow-md rounded-lg p-4 mt-2 bg-card h-auto sm:h-125 md:h-150">
      {/* Fixed Header */}
      <div className="flex justify-center items-center sticky top-0 bg-card z-10 p-4 shadow-md rounded-lg">
        <h2 className="text-lg font-semibold text-foreground text-center">
          <span>{title}</span>
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
      <div 
        className={cn(
          "flex-col-reverse overflow-y-auto pt-4",
          reply ? 'mb-40' : 'mb-20',
        )}
      >
        {messages.map((message, index) => {
          const nextMessage = messages[index + 1];
          const prevMessage = messages[index - 1];

          // Check if a date separator is needed (first message or new day)
          let showDateSeparator = false;
          if (!prevMessage) {
            showDateSeparator = true;
          } else {
            const prevDate = new Date(prevMessage.createdAt).toDateString();
            const currDate = new Date(message.createdAt).toDateString();
            showDateSeparator = prevDate !== currDate;
          }
          return (
          <div key={message._id}>
            {/* Date separator */}
            {showDateSeparator && (
              <div className="flex justify-center my-2">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                  {new Date(message.createdAt).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Message bubble */}
            <ChatBubble
              message={message}
              admin={admin}
              nextMessage={nextMessage}
              prevMessage={prevMessage}
              handleUpdate={handleUpdateClicked}
              handleDelete={deleteMessage}
              setRepliedMessage={changeRepliedMessage}
              scrollMessageIntoView={scrollMessageIntoView}
            />
          </div>
        );
        })}
        
      </div>
      <div ref={messagesEndRef} />
      {/* Input Section */}
      <MessageInput
        repliedMessage={reply}
        setRepliedMessage={changeRepliedMessage}
        value={newMessage}
        changeValue={setNewMessage}
        handleSend={send}
      />

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

export default Chat;
