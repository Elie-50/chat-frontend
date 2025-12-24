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

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isSwiping.current = false;

    longPressHandlers.onPointerDown();
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

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

  function onPointerUp() {
    longPressHandlers.onPointerUp();

    if (isSwiping.current && swipeX > 60) {
      navigator.vibrate?.(5);
      console.log("Reply to:", message._id);
    }

    setSwipeX(0);
    isSwiping.current = false;
  }

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
        ${isOwnMessage ? "bg-bubble text-foreground" : "bg-input text-foreground"}
        ${isGrouped ? "mb-0" : "mb-1"}
        transition-transform duration-150
        group select-none touch-pan-y`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
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
        {isOwnMessage && (
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
              <DropdownMenuItem
                onClick={() => {
                  handleUpdate(message._id);
                  setMenuOpen(false);
                }}
              >
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleDelete(message._id);
                  setMenuOpen(false);
                }}
              >
                <Trash />
                Delete
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
          {message.modification === "Deleted" ? (
            <span className="flex items-center gap-2 text-muted-foreground text-sm italic wrap-break-word">
              <Ban className="w-4 h-4" />
              This message was deleted
            </span>
          ) : (
            <span className="text-base leading-relaxed wrap-break-word max-w-full">
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
