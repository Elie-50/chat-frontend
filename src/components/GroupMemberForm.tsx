import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import { useSearchStore } from "@/store/searchStore";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import MemberCard from "./MemberCard";
import { Button } from "./ui/button";

interface Props {
  id?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;

function GroupMemberForm({ id }: Props) {
  const {
    findGroupData,
    selectedGroup,
    error,
    addMemberToGroup,
  } = useGroupStore();

  const { accessToken } = useAuthStore();
  const {
    fetchFriends,
    friendsSearch: friendsResult,
    loading: friendsLoading,
  } = useSearchStore();

  const [searchParams, setSearchParams] = useSearchParams();

  const tab = (searchParams.get("tab") ?? "members") as
    | "members"
    | "friends";

  const page = Number(searchParams.get("page") ?? DEFAULT_PAGE);
  const size = Number(searchParams.get("size") ?? DEFAULT_SIZE);

  useEffect(() => {
    if (id && accessToken && selectedGroup?._id !== id) {
      findGroupData(id);
    }
  }, [id, accessToken, selectedGroup, findGroupData]);


  useEffect(() => {
    if (tab === "friends" && accessToken) {
      fetchFriends({ page, size });
    }
  }, [tab, page, size, accessToken, fetchFriends]);


  const groupMemberIds = useMemo(() => {
    return new Set(selectedGroup?.participants.map((p) => p._id));
  }, [selectedGroup]);


  const handleaddMemberToGroup = async (friendId: string) => {
    if (!id) return;
    await addMemberToGroup({ conversationId: id, memberId: friendId});
  };

  const changeTab = (newTab: "members" | "friends") => {
    setSearchParams({
      tab: newTab,
      page: "1",
      size: String(size),
    });
  };

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastFriendRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (friendsLoading) return;
      if (!friendsResult) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          friendsResult.currentPage < friendsResult.totalPages
        ) {
          setSearchParams({
            tab,
            page: String(page + 1),
            size: String(size),
          });
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [
      friendsLoading,
      friendsResult,
      page,
      size,
      tab,
      setSearchParams,
    ]
  );

  return (
    <div className="w-full mt-10">
      <h2 className="text-lg text-center font-semibold mb-4">
        Group Members
      </h2>

      <div className="flex justify-center gap-4 border-b mb-6">
        <button
          onClick={() => changeTab("members")}
          className={`pb-2 text-sm font-medium transition-colors ${
            tab === "members"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Members
        </button>

        <button
          onClick={() => changeTab("friends")}
          className={`pb-2 text-sm font-medium transition-colors ${
            tab === "friends"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Add Friends
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {tab === "members" && (
        <section className="space-y-2">
          {selectedGroup?.participants.map((member) => (
            <MemberCard
              key={member._id}
							conversationId={selectedGroup._id}
              admin={selectedGroup.admin}
              member={member}
            />
          ))}
        </section>
      )}

      {tab === "friends" && friendsResult && (
        <section className="space-y-2">
          {friendsResult.friends.map((friend, index) => {
            const isAlreadyMember = groupMemberIds.has(friend._id);
            const isLast =
              index === friendsResult.friends.length - 1;

            return (
              <div
                key={friend._id}
                ref={isLast ? lastFriendRef : undefined}
                className="flex items-center justify-between px-4 py-3 rounded-lg border bg-card"
              >
                <p className="font-medium text-sm">
                  {friend.username}
                </p>

                <Button
                  disabled={isAlreadyMember}
                  onClick={() => handleaddMemberToGroup(friend._id)}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    isAlreadyMember
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAlreadyMember ? "Added" : "Add"}
                </Button>
              </div>
            );
          })}

          {/* Loading indicator at bottom */}
          {friendsLoading && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Loading more friends…
            </p>
          )}

          {/* End indicator */}
          {friendsResult.currentPage ===
            friendsResult.totalPages && (
            <p className="text-center text-xs text-muted-foreground py-4">
              No more friends to load
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export default GroupMemberForm;
