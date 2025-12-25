import { SendHorizonal, X } from "lucide-react";
import { InputGroup, InputGroupButton, InputGroupTextarea } from "./ui/input-group";
import type { Message } from "@/store/chatStore";
import { Button } from "./ui/button";
import { stringToColor } from "@/lib/utils";

type MessgeInputProps = {
	value: string;
	changeValue: (value: string) => void;
	handleSend: () => void;
	repliedMessage: Message | null;
	setRepliedMessage: (message: Message | null) => void;
}
function MessageInput({ value, changeValue, handleSend, repliedMessage, setRepliedMessage }: MessgeInputProps) {
	const handleKeyPressed = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
      handleSend();
    }
	}

	return (
		<div>
			{repliedMessage && (
				<div className="flex items-center bg-input p-2 rounded-lg mb-2">
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
					value={value}
					onChange={(e) => changeValue(e.target.value)}
					placeholder="Type a Message..."
					onKeyDown={handleKeyPressed}
				/>
				<InputGroupButton 
					variant="default"
					className="rounded-full mx-2"
					size='icon-sm'
					disabled={value.trim().length === 0}
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
