import { BACKEND_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore"
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

function OnlineStateTracker() {
	const { accessToken } = useAuthStore();
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!accessToken) return;

		const socket = io(BACKEND_URL + '/online', {
			transports: ['websocket'],
			auth: { token: accessToken },
		});

		socketRef.current = socket;

		socket.emit('user:connected', {});

		const handleUnload = () => {
			socket.emit("user:disconnected");
		};

		window.addEventListener("beforeunload", handleUnload);

		return () => {
			window.removeEventListener("beforeunload", handleUnload);
			socket.disconnect();
			socketRef.current = null;
		}
	}, [accessToken]);
	return null;
}

export default OnlineStateTracker
