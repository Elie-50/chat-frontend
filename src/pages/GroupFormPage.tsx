import GroupForm from "@/components/GroupForm";
import { useParams } from "react-router-dom";

function GroupsForm() {
  const params = useParams();
  const _id = params.groupId;
  return (
    <>
      <GroupForm _id={_id} /> 
    </>
  )
}

export default GroupsForm