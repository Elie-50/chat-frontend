import ChatBubble from './ChatBubble';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, SendHorizonal } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import type { Message } from '@/store/chatStore';
import { type Ref } from 'react';

interface ChatProps {
	_id: string,
  title: string;
	loadEarlierMessages: () => void;
	messages: Message[];
	handleUpdateClicked: (messageId: string) => void;
	deleteMessage: (messageId: string) => void;
	newMessage: string;
	setNewMessage: (value: string) => void;
	handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
	updatingMessageId: string | null;
	handleUpdate: (messageId: string, newValue: string) => void;
	handleSend: (_id: string) => void;
	isDialogOpen: boolean,
	setIsDialogOpen: (open: boolean) => void;
	handleDialogSubmit: () => void;
	handleDialogClose: () => void;
	messagesEndRef?: Ref<HTMLDivElement>;
}

const Chat: React.FC<ChatProps> = ({ 
	_id,
	title,
	loadEarlierMessages,
	messages,
	handleUpdateClicked,
	deleteMessage,
	newMessage,
	setNewMessage,
	handleKeyDown,
	updatingMessageId,
	handleUpdate,
	handleSend,
	isDialogOpen,
	setIsDialogOpen,
	handleDialogSubmit,
	handleDialogClose,
	messagesEndRef,
}) => {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto shadow-md rounded-lg p-4 mt-2 bg-card h-auto sm:h-125 md:h-150">
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
      <div className="flex-1 overflow-y-auto mb-4 pt-4">
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
              nextMessage={nextMessage}
              prevMessage={prevMessage}
              handleUpdate={handleUpdateClicked}
              handleDelete={deleteMessage}
            />
          </div>
        );
        })}
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
					onMouseDown={(e) => e.preventDefault()}
  				onTouchStart={(e) => e.preventDefault()}
          onClick={() => {
            if (!newMessage.trim()) return;

            if (updatingMessageId) {
              handleUpdate(updatingMessageId, newMessage);
            } else {
              handleSend(_id);
            }
          }}
          variant="secondary"
          className="bg-bubble text-foreground hover:bg-chart-1/80 px-4 py-2 rounded-full ml-2"
        >
          {newMessage.length > 0 ? (
            <SendHorizonal className="w-5 h-5" />
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

export default Chat;
