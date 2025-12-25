import { useState, useRef } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Ban, CornerDownLeft, MoreHorizontal, Pencil, Trash } from "lucide-react";
import type { Message } from "@/store/chatStore";
import { stringToColor } from "@/lib/utils";

type Props = {
  message: Message;
  admin?: string;
  nextMessage?: Message;
  prevMessage?: Message;
  handleUpdate: (_id: string) => void;
  handleDelete: (_id: string) => void;
  setRepliedMessage: (message: Message | null) => void;
};

function ChatBubble({
  message,
  admin,
  nextMessage,
  prevMessage,
  handleUpdate,
  handleDelete,
  setRepliedMessage,
}: Props) {
  const { user } = useAuthStore();
  const isOwnMessage = user?.username === message.sender;
  const isAdmin = admin && admin === user?._id;
  const isDeleted = message.modification?.includes('Deleted');

  const [menuOpen, setMenuOpen] = useState(false);
  const [, setPressed] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const [swipeX, setSwipeX] = useState(0);
  const isSwiping = useRef(false);

  const longPressHandlers = useLongPress({
    delay: 500,
    onLongPress: () => {
      if (isOwnMessage) {
        setMenuOpen(true);
        setPressed(true);
        setTimeout(() => setPressed(false), 150);
      }
    },
  });

  const changeRepliedMessage = () => {
    setRepliedMessage(message);
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0];
    
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isSwiping.current = false;

    longPressHandlers.onPointerDown();
  }

  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (isDeleted) {
      return;
    }
    const touch = e.touches[0];

    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // If user is scrolling vertically, abort swipe
    if (Math.abs(dy) > Math.abs(dx)) {
      longPressHandlers.onPointerCancel();
      return;
    }

    // Horizontal swipe detected
    if (dx > 8) {
      isSwiping.current = true;
      longPressHandlers.onPointerCancel();
      setSwipeX(Math.min(dx, 80));
    }
  }

  function onTouchStop() {
    longPressHandlers.onPointerUp();

    if (isSwiping.current && swipeX > 60) {
      changeRepliedMessage();
    }

    setSwipeX(0);
    isSwiping.current = false;
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
        className={`relative rounded-xl px-4 py-3 max-w-[85%] lg:max-w-md text-foreground
        ${isOwnMessage ? "bg-bubble " : "bg-input"}
        ${isGrouped ? "mb-0" : "mb-1"}
        transition-transform duration-150
        group select-none touch-pan-y`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchStop}
        onTouchCancel={onTouchStop}
      >
        {swipeX > 20 && (
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-muted-foreground">
            <CornerDownLeft />
          </div>
        )}
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
        {!isDeleted && (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Message actions"
              >
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {isOwnMessage && (
                <DropdownMenuItem
                  onClick={() => {
                    handleUpdate(message._id);
                    setMenuOpen(false);
                  }}
                >
                  <Pencil />
                  Edit
                </DropdownMenuItem>
              )}
              {(isOwnMessage || isAdmin) && (
                <DropdownMenuItem
                  onClick={() => {
                    handleDelete(message._id);
                    setMenuOpen(false);
                  }}
                >
                  <Trash />
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={changeRepliedMessage}
              >
                <CornerDownLeft />
                Reply
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {menuOpen && (
          <div
            className="absolute inset-0 rounded-xl bg-card/30 pointer-events-none"
            aria-hidden
          />
        )}

        {/* Message content + footer */}
        <div className="flex flex-wrap items-end gap-x-2">
          {(message.modification?.includes('Deleted')) ? (
            <span className="flex items-center gap-2 text-muted-foreground text-sm italic wrap-break-word">
              <Ban className="w-4 h-4" />
              This message was {" "} {message.modification.toLowerCase()}
            </span>
          ) : (
            <div className="text-base leading-relaxed wrap-break-word max-w-full">
              {/* Reply */}
              {message.reply && (
                <div
                  style={{
                    borderLeft: `4px solid ${stringToColor(message.reply.sender)}`,
                  }}
                className="border-l-4 w-full rounded-lg p-3 mb-2 bg-input/50 text-foreground font-medium italic"
                >
                  <p className="text-sm text-muted-foreground font-semibold">Replying to {message.reply.sender}</p>
                  <p className="mt-1">{message.reply.content}</p>
                </div>
              )}
              {/* Actual content */}
              <span>
                {message.content}
              </span>
            </div>
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
