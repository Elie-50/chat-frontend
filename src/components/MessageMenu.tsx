import React from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash, CornerDownLeft } from "lucide-react";
import { useGroupStore } from "@/store/groupStore";
import { useAuthStore } from "@/store/authStore";

interface MessageMenuProps {
  isOwnMessage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const MessageMenu: React.FC<MessageMenuProps> = ({
  isOwnMessage,
  onEdit,
  onDelete,
  onReply,
  menuOpen,
  setMenuOpen,
}) => {
	const { selectedGroup } = useGroupStore();
	const { user } = useAuthStore();
	const isAdmin = selectedGroup?.admin === user?._id;
  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Message actions"
        >
          <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {isOwnMessage && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil /> Edit
          </DropdownMenuItem>
        )}
        {(isOwnMessage || isAdmin) && (
          <DropdownMenuItem onClick={onDelete}>
            <Trash /> Delete
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onReply}>
          <CornerDownLeft /> Reply
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default React.memo(MessageMenu);
