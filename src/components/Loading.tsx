import { Spinner } from '@/components/ui/spinner';

function Loading() {
	return (
		<div className="flex justify-center items-center h-screen mb-0 overflow-y-hidden">
			<Spinner className="h-20 w-20 text-blue-500" />
		</div>
	);
}

export default Loading
