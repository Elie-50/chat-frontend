import { useAuthStore } from "@/store/authStore";
import { 
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import { Ban, MoreHorizontal } from "lucide-react";

type Message = {
  _id: string;
  sender: string;
  content: string;
  modification?: string;
}

type Props = {
  message: Message;
  handleUpdate: (_id: string) => void;
  handleDelete: (_id: string) => void;
};

function ChatBubble({ message, handleUpdate, handleDelete }: Props) {
  const { user } = useAuthStore();
  const isOwnMessage = user?.username === message.sender;

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} space-x-2 py-2 px-4`}
    >
      <div className={`relative ${isOwnMessage ? 'bg-muted' : 'bg-input'} text-foreground rounded-lg p-3 max-w-xs w-full`}>
        {/* Three Dots Menu */}
        {isOwnMessage && (
          <DropdownMenu>
            <DropdownMenuTrigger className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border rounded-lg shadow-md">
              <DropdownMenuItem onClick={() => handleUpdate(message._id)}>Update</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(message._id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sender's name */}
        {!isOwnMessage && (
          <div className="font-semibold text-foreground text-sm">
            {message.sender}
          </div>
        )}

        {/* Message Content or 'Deleted' */}
        <div className="text-sm text-foreground">
          {message.modification === 'Deleted' ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Ban className="w-5 h-5" /> {/* Stop sign icon */}
              <span>This message was deleted</span>
            </div>
          ) : (
            message.content
          )}
        </div>
        
        {
          (message.modification && message.modification === 'Edited') && (
            <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
              {message.modification}
            </div>
          )
        }
      </div>
    </div>
  );
}

export default ChatBubble;
