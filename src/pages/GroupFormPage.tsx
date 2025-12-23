import GroupForm from "@/components/GroupForm";
import GroupMemberForm from "@/components/GroupMemberForm";
import { useParams } from "react-router-dom";

function GroupsForm() {
  const params = useParams();
  const _id = params.groupId;
  return (
    <>
      <div className="flex flex-col lg:flex-row w-full mx-2">
        <div className="w-full lg:w-1/2">
          <GroupForm _id={_id} />
        </div>
        <div className="w-full lg:w-1/2">
          <GroupMemberForm id={_id} />
        </div>
      </div>
    </>
  )
}

export default GroupsForm