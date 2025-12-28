import { SendHorizonal, X } from "lucide-react";
import { InputGroup, InputGroupButton, InputGroupTextarea } from "./ui/input-group";
import { useChatStore, type Message } from "@/store/chatStore";
import { Button } from "./ui/button";
import { scrollMessageIntoView, stringToColor } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { useAuthStore } from "@/store/authStore";

type MessgeInputProps = {
	handleSend: () => void;
	repliedMessage: Message | null | undefined;
	setRepliedMessage: (message: Message | null) => void;
}
function MessageInput({ handleSend, repliedMessage, setRepliedMessage }: MessgeInputProps) {
	const isMobile = useIsMobile();
	const { currentlyTyping, newMessage, setNewMessage } = useChatStore();
	const { user } = useAuthStore();
	const others = currentlyTyping.filter((t) => t._id !== user?._id);
	
	const handleKeyPressed = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !isMobile) {
			e.preventDefault();
      handleSend();
    }
	}

	return (
		<div className="fixed bottom-0 left-0 p-3 rounded-t-2xl bg-background w-full m-0">
			{others.length > 0 && (
				<div className="mb-2">
					{(() => {
						if (others.length === 1) {
							return <span>{others[0].username} is typing...</span>
						}
						else if (others.length === 2) {
							return (
								<span>
									{others[0].username}, and {others[1].username} are typing...
								</span>
							);
						} else {
							const [first, second, ...rest] = others;
							return (
								<span>
									{first.username}, {second.username} and {rest.length} others are typing...
								</span>
							);
						}
					})()}
				</div>
			)}
			{repliedMessage && (
				<div
					className="flex items-center bg-input p-2 rounded-lg mb-2"
					onClick={() => scrollMessageIntoView(repliedMessage._id)}
				>
					<div className="grow">
						<p>
							Repling to {" "}
							<span 
								className="font-bold text-muted-foreground"
								style={{ color: stringToColor(repliedMessage.sender) ?? '#000' }}
							>
								{repliedMessage.sender}
							</span>
						</p>
						<p className="truncate max-w-xs">
							"{repliedMessage.content}"
						</p>
					</div>
					<Button
						variant='ghost'
						size='icon-sm'
						onClick={() => setRepliedMessage(null)}
						aria-label="Remove Reply"
					>
						<X />
					</Button>
				</div>
			)}
			<InputGroup>
				<InputGroupTextarea
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Type a Message..."
					onKeyDown={handleKeyPressed}
				/>
				<InputGroupButton 
					variant="default"
					className="rounded-full mx-2"
					size='icon-sm'
					disabled={newMessage.trim().length === 0}
					onClick={handleSend}
					onMouseDown={(e) => e.preventDefault()}
					onTouchStart={(e) => e.preventDefault()}
				>
					<SendHorizonal />
					<span className="sr-only">Send</span>
				</InputGroupButton>
			</InputGroup>
		</div>
	)
}

export default MessageInput
