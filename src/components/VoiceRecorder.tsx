import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type State = "idle" | "recording" | "recorded";

export default function WhatsAppVoiceMessage() {
	const recorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const [state, setState] = useState<State>("idle");
	const [audioUrl, setAudioUrl] = useState<string | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [current, setCurrent] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		return () => {
			if (audioUrl) URL.revokeObjectURL(audioUrl);
			streamRef.current?.getTracks().forEach((t) => t.stop());
		};
	}, [audioUrl]);

	const startRecording = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const recorder = new MediaRecorder(stream);

		chunksRef.current = [];
		streamRef.current = stream;
		recorderRef.current = recorder;

		recorder.ondataavailable = (e) =>
			e.data.size && chunksRef.current.push(e.data);

		recorder.onstop = () => {
			const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
			setAudioUrl(URL.createObjectURL(blob));
			setState("recorded");
		};

		recorder.start();
		setState("recording");
	};

	const stopRecording = () => {
		recorderRef.current?.stop();
		streamRef.current?.getTracks().forEach((t) => t.stop());
		setState("idle");
	};

	const togglePlay = () => {
		if (!audioRef.current) return;

		if (audioRef.current.paused) {
			audioRef.current.play();
			setIsPlaying(true);
		} else {
			audioRef.current.pause();
			setIsPlaying(false);
		}
	};

	const seek = (value: number) => {
		if (!audioRef.current) return;
		audioRef.current.currentTime = value;
		setCurrent(value);
	};

	const format = (s: number) =>
		`${Math.floor(s / 60)}:${`${Math.floor(s % 60)}`.padStart(2, "0")}`;

	return (
		<div className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-white max-w-sm">
			{/* Mic / Stop */}
			{state !== "recording" ? (
				<Button
					size="icon"
					variant="ghost"
					onClick={startRecording}
					className="rounded-full text-white hover:bg-white/10"
				>
					<Mic className="h-5 w-5" />
				</Button>
			) : (
				<Button
					size="icon"
					variant="ghost"
					onClick={stopRecording}
					className="rounded-full bg-red-500 text-white animate-pulse"
				>
					<Square className="h-4 w-4" />
				</Button>
			)}

			{/* Playback bubble */}
			{audioUrl && (
				<>
					<Button
						size="icon"
						variant="ghost"
						onClick={togglePlay}
						className="rounded-full text-white hover:bg-white/10"
					>
						{isPlaying ? (
							<Pause className="h-4 w-4" />
						) : (
							<Play className="h-4 w-4" />
						)}
					</Button>

					<div className="flex flex-1 flex-col gap-1">
						<input
							type="range"
							min={0}
							max={duration}
							step={0.01}
							value={current}
							onChange={(e) => seek(+e.target.value)}
							className={cn(
								"h-1 w-full appearance-none rounded-full bg-white/30",
								"[&::-webkit-slider-thumb]:appearance-none",
								"[&::-webkit-slider-thumb]:h-3",
								"[&::-webkit-slider-thumb]:w-3",
								"[&::-webkit-slider-thumb]:rounded-full",
								"[&::-webkit-slider-thumb]:bg-white",
							)}
						/>

						<div className="flex justify-end text-[10px] opacity-80">
							{format(current)} / {format(duration)}
						</div>
					</div>

					<audio
						ref={audioRef}
						src={audioUrl}
						onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
						onLoadedMetadata={() =>
							setDuration(audioRef.current?.duration ?? 0)
						}
						onEnded={() => setIsPlaying(false)}
					/>
				</>
			)}
		</div>
	);
}
