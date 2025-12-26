import { Toaster } from "@/components/ui/sonner"
import { BACKEND_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore"
import { useGroupStore, type Participant } from "@/store/groupStore";
import { useSearchStore } from "@/store/searchStore";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

type GroupNotification = {
	senderName: string;
	group: {
		_id: string;
		name: string;
	}
};

function Notifications() {
	const { accessToken } = useAuthStore();
	const { selectedGroup } = useGroupStore();
	const { user } = useSearchStore();
	const socketRef = useRef<Socket | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		audioRef.current = new Audio('/sounds/pop-up-notify.mp3');
	}, []);

	const playAudio = () => {
		if (!audioRef.current) {
			console.warn('No audio');
			return;
		}
		audioRef.current.currentTime = 0;
		audioRef.current.play().catch(() => {});
	};

	useEffect(() => {
		if (!accessToken) return;

		const socket = io(BACKEND_URL + '/notifications', {
			transports: ['websocket'],
			auth: { token: accessToken },
		});

		socketRef.current = socket;

		socket.emit('auth:init', {}, (res: { ok: boolean }) => {
			if (!res?.ok) {
				socket.disconnect();
				return;
			}
			console.log('Socket authenticated');
		});

		socket.on('notify:group-message', (data: GroupNotification) => {
			if (selectedGroup && selectedGroup._id === data.group._id) {
				return;
			}
			toast("New Group Message", {
				description: `${data.senderName} sent a message to group "${data.group.name}"`,
				action: {
					label: "Open", 
					onClick: () => navigate(`/group-chat/${data.group._id}`),
				}
			});

			playAudio();
		});

		socket.on('notify:private-message', (data: { sender: Participant}) => {
			if (user?._id === data.sender._id) {
				return;
			}
			toast("New Message Received", {
				description: `${data.sender.username} sent you a message!`,
				action: {
					label: "Open",
					onClick: () => navigate(`/private-chat/${data.sender._id}`),
				}
			});
			playAudio();
		});

		return () => {
			socket.off();
			socket.disconnect();
			socketRef.current = null;
		};
	}, [accessToken, selectedGroup, navigate, user]);

	return (
		<>
			<Toaster 
				position="top-right"
				richColors
				closeButton
			/>
		</>
	)
}

export default Notifications
