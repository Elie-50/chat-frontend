import { useState, useRef, useMemo } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { useAuthStore } from "@/store/authStore";
import { Ban, ChevronDown, CornerDownLeft } from "lucide-react";
import { useChatStore, type Message } from "@/store/chatStore";
import { cn, scrollMessageIntoView, stringToColor } from "@/lib/utils";
import React from "react";
import MessageMenu from "./MessageMenu";

type Props = {
  message: Message;
  admin?: string;
  nextMessage?: Message;
  prevMessage?: Message;
  handleUpdate: (_id: string) => void;
  handleDelete: (_id: string) => void;
  setRepliedMessage: (message: Message | null) => void;
};

const ChatBubble = ({
  message,
  nextMessage,
  prevMessage,
	handleDelete,
	handleUpdate,
  setRepliedMessage,
}: Props) => {
  const { user } = useAuthStore();
	const { setSelectedMessage, selectedMessage, reply } = useChatStore();
  const isOwnMessage = user?.username === message.sender;
  const isDeleted = message.modification?.includes('Deleted');

  const startX = useRef(0);
  const startY = useRef(0);
  const [swipeX, setSwipeX] = useState(0);
  const isSwiping = useRef(false);

  const longPressHandlers = useLongPress({
    delay: 500,
    onLongPress: () => {
      setSelectedMessage(message);
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
		if (isDeleted) return;

		const touch = e.touches[0];
		const dx = touch.clientX - startX.current;
		const dy = touch.clientY - startY.current;

		// Abort if vertical scroll
		if (Math.abs(dy) > Math.abs(dx)) {
			longPressHandlers.onPointerCancel();
			return;
		}

		// Horizontal swipe
		if (dx > 8) {
			isSwiping.current = true;
			longPressHandlers.onPointerCancel();

			// Instead of updating every pixel, throttle updates
			const clamped = Math.min(dx, 80);
			if (Math.abs(clamped - swipeX) > 5) {
				// only update if moved at least 5px since last render
				setSwipeX(clamped);
			}
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

  const uniqueColor = useMemo(() => stringToColor(message.sender), [message.sender]);
	const replyColor = useMemo(() => stringToColor(message.reply?.sender.username || ''), [message.reply?.sender.username]);
	const formattedDate = useMemo(() => 
		new Date(message.createdAt).toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		}), 
		[message.createdAt]
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
		<div className={cn(
			reply?._id === message._id && "w-full bg-blue-400 rounded-sm opacity-75"
		)}>
			<div
				data-id={message._id}
				className={`flex ${
					isOwnMessage ? "justify-end" : "justify-start"
				} px-3 py-1`}
			>
				<div
					className={`relative rounded-xl px-4 py-3 max-w-[85%] lg:max-w-md text-foreground
					${isOwnMessage ? "bg-bubble-100" : "bg-bubble"}
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
									? "border-l-10 border-l-bubble-100"
									: "border-r-10 border-r-bubble"
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
					{(!isDeleted && selectedMessage) && (
						<MessageMenu
							isOwnMessage={isOwnMessage}
							onEdit={() => handleUpdate(message._id)}
							onDelete={() => handleDelete(message._id)}
							onReply={changeRepliedMessage}
							menuOpen={selectedMessage._id == message._id}
							setMenuOpen={() => { setSelectedMessage(null)}}
						/>
					)}

					{/* Three-dot button (only on large screens, visible on hover) */}
					{!isDeleted && (
						<button
							type="button"
							onClick={() => setSelectedMessage(message)}
							className="absolute top-1 right-1 hidden lg:flex items-center justify-center p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 group-hover:cursor-pointer transition-opacity"
						>
							<span className="sr-only">Options</span>
							<ChevronDown className="w-5 h-5" />
							</button>
						)}

					{selectedMessage?._id === message._id && (
          <div
            className="absolute inset-0 rounded-xl bg-card/30 pointer-events-none"
            aria-hidden
          />
        )}

					{/* Message content + footer */}
					<div className="flex flex-wrap items-end gap-x-2">
						{(isDeleted) ? (
							<span className="flex items-center gap-2 text-muted-foreground text-sm italic wrap-break-word">
								<Ban className="w-4 h-4" />
								This message was {" "} {message.modification!.toLowerCase()}
							</span>
						) : (
							<div className={`text-base leading-relaxed wrap-break-word max-w-full ${message.reply && 'w-full'}`}>
								{/* Reply */}
								{message.reply && (
									<div
									style={{
										borderLeft: `4px solid ${replyColor}`,
									}}
									className="border-l-4 w-full rounded-lg p-3 mb-2 bg-input/50 text-foreground font-medium italic"
									onClick={() => scrollMessageIntoView(message.reply?._id as string)}
									>
										<p className="text-sm text-muted-foreground font-semibold">Replying to {" "}
											<span
												style={{
													color: replyColor,
												}}
											>
												{message.reply.sender.username}
											</span>
										</p>
										<p className="mt-1 truncate max-w-xs">{message.reply.content}</p>
									</div>
								)}
								{/* Actual content */}
								<span>
									{message.content}
								</span>
							</div>
						)}

						<span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
							{message.modification === "Edited" && (
								<span className="italic">Edited</span>
							)}
							<span className="flex items-center gap-1">
								{formattedDate}
							</span>
						</span>

					</div>
				</div>
			</div>
		</div>
  );
}

export default React.memo(ChatBubble);
