import { useAuthStore } from "@/store/authStore";
import { useGroupStore, type Group, type GroupSearch } from "@/store/groupStore";
import { useEffect } from "react";
import { FAB } from "@/components/fab";
import { EmptyGroupChats } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { MessageCircleDashed, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function GroupsPage() {
	const { fetchGroups, groups } = useGroupStore();
	const { accessToken } = useAuthStore();

	useEffect(() => {
		if (accessToken) {
			fetchGroups({ page: 1, size: 20 });
		}
	}, [fetchGroups, accessToken])
	
	return (
		<div>
			{
				(groups && groups.data.length === 0)
					? <EmptyGroupChats />
					: <GroupsDisplay groups={groups!} />
			}
			<FAB />
		</div>
	)
}

export default GroupsPage


function GroupsDisplay({ groups }: { groups: GroupSearch }) {
  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
			<h1 className="text-center text-2xl mb-4 font-semibold">Your Group Chat</h1>
      {/* Wrap everything in a flex container with a grid for responsive display */}
      <div className="gap-8">
        {groups?.data.map((grp) => (
          <GroupItem key={grp._id} group={grp} />
        ))}
      </div>
    </div>
  );
}

function GroupItem({ group }: { group: Group }) {
  const { user } = useAuthStore()
  const isAdmin = group.admin === user?._id

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border bg-card px-6 py-4 my-2 shadow-sm transition-all hover:shadow-md",
        isAdmin && "border-primary/40"
      )}
    >
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-foreground">
          {group.name}
        </h2>
        {isAdmin && (
          <span className="text-xs text-muted-foreground">
            You're the admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Admin-only edit button */}
        {isAdmin && (
					<Link to={`/groups/edit/${group._id}`}>
						<Button
							variant="outline"
							size="sm"
							className="flex items-center gap-2"
						>
							<Pencil className="h-4 w-4" />
							Edit
						</Button>
					</Link>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <MessageCircleDashed className="h-4 w-4" />
          Open Chat
        </Button>
      </div>
    </div>
  )
}