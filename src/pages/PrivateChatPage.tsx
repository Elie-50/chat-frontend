import PrivateChat from "@/components/PrivateChat"
import { useParams } from "react-router-dom"

function PrivateChatPage() {
	const { recipientId } = useParams<{ recipientId: string }>();

	return (
		<div>
			{
				recipientId && <PrivateChat recipientId={recipientId} />
			}
		</div>
	)
}

export default PrivateChatPage
