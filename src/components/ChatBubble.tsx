import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Ban, MoreHorizontal } from "lucide-react";
import type { Message } from "@/store/chatStore";

type Props = {
  message: Message;
  nextMessage?: Message;
  prevMessage?: Message;
  handleUpdate: (_id: string) => void;
  handleDelete: (_id: string) => void;
};

function ChatBubble({
  message,
  nextMessage,
  prevMessage,
  handleUpdate,
  handleDelete,
}: Props) {
  const { user } = useAuthStore();
  const isOwnMessage = user?.username === message.sender;

  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // keep 32-bit integer
    }

    // More variation in hue
    const hue = Math.abs(hash) % 360;

    // Vary saturation and lightness based on hash to get more distinct colors
    const saturation = 50 + (Math.abs(hash) % 30); // 50% - 79%
    const lightness = 40 + (Math.abs(hash) % 20);  // 40% - 59%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  const uniqueColor = stringToColor(message.sender);

  const formattedDate = new Date(message.createdAt).toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

  // Determine if this message is part of a consecutive group
  const isGrouped =
    nextMessage?.sender === message.sender &&
    new Date(nextMessage.createdAt).getTime() -
      new Date(message.createdAt).getTime() <
      5 * 60 * 1000; // 5 min window for grouping

  const isGroupedPrev =
    prevMessage?.sender === message.sender &&
    new Date(message.createdAt).getTime() -
      new Date(prevMessage.createdAt).getTime() <
      5 * 60 * 1000;
  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      } px-3 py-1`}
    >
      <div
        className={`relative rounded-xl px-4 py-3 max-w-[85%] lg:max-w-md
        ${isOwnMessage ? "bg-bubble text-white" : "bg-input text-foreground"}
        ${isGrouped ? "mb-0" : "mb-1"} group`}
      >
        {/* Message tail */}
        {!isGrouped && (
          <div
            className={`absolute bottom-0 ${
              isOwnMessage ? "right-0" : "left-0"
            } w-0 h-0 border-t-10 border-t-transparent ${
              isOwnMessage
                ? "border-l-10 border-l-bubble"
                : "border-r-10 border-r-transparent"
            }`}
          />
        )}

        {/* Header: sender name (only if not own message & not grouped) */}
        {!isOwnMessage && !isGroupedPrev && (
          <div
            className="font-semibold text-sm mb-1"
            style={{ color: uniqueColor ?? '#000' }}
          >
            {message.sender}
          </div>
        )}

        {/* Menu (hidden until hover / tap) */}
        {isOwnMessage && (
          <DropdownMenu>
            <DropdownMenuTrigger className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground hover:cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUpdate(message._id)}>
                Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(message._id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Message content + footer */}
        <div className="flex flex-wrap items-end gap-x-2">
          {message.modification === "Deleted" ? (
            <span className="flex items-center gap-2 text-muted-foreground text-sm italic wrap-break-word">
              <Ban className="w-4 h-4" />
              This message was deleted
            </span>
          ) : (
            <span className="text-base leading-relaxed wrap-break-word break-all">
              {message.content}
            </span>
          )}

          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            {message.modification === "Edited" && <span>Edited</span>}
            <span>{formattedDate}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatBubble;
