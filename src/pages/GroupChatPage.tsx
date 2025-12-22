import GroupChat from "@/components/GroupChat"
import { useParams } from "react-router-dom"

function GroupChatPage() {
	const { conversationId } = useParams<{ conversationId: string }>();

	return (
		<div>
			{
				conversationId && <GroupChat conversationId={conversationId} />
			}
		</div>
	)
}

export default GroupChatPage
