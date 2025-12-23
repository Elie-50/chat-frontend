import { useGroupStore, type Participant } from "@/store/groupStore";
import { Button } from "./ui/button";
import { CrownIcon, UserMinus } from "lucide-react";

interface Props {
  member: Participant;
  admin: string;
	conversationId: string;
}

function MemberCard({ member, admin, conversationId }: Props) {
  const isAdmin = admin === member._id;
	const { removerMemberFromGroup, loading } = useGroupStore();

	const removeMember = async () => {
		await removerMemberFromGroup({ conversationId, memberId: member._id })
	}

  return (
    <div className="flex items-center justify-between px-4 py-3 mx-5 my-2 rounded-lg bg-input border border-border hover:bg-muted transition-colors">
      {/* Left side: username */}
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm">{member.username}</p>

        {isAdmin && (
          <span className="flex items-center gap-1 text-xs text-yellow-500">
            <CrownIcon className="w-4 h-4" />
            Admin
          </span>
        )}
      </div>

      {/* Right side: action */}
      {!isAdmin && (
        <Button
					onClick={removeMember}
					disabled={loading}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <UserMinus className="w-4 h-4" />
          Remove
        </Button>
      )}
    </div>
  );
}

export default MemberCard;
