import type React from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export const FAB: React.FC = () => {

	return (
		<Link to='/groups/new' className="fixed bottom-10 right-10">
			<div className="flex justify-center items-center rounded-full h-12 w-12 hover:cursor-pointer bg-input hover:bg-input/70">
				<Plus className="h-5 w-5 text-foreground" />
			</div>
		</Link>
	);
}