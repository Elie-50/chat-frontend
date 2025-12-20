import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { useAuthStore } from "@/store/authStore"
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { useGroupStore } from "@/store/groupStore";
import { useNavigate } from "react-router-dom";

function GroupForm({ _id }: { _id?: string }) {
  const { accessToken } = useAuthStore();
	const { error, loading, createGroup, updateGroup, groups } = useGroupStore();
	const defaultName = groups?.data.find((grp) => grp._id == _id)?.name || '';
  const [name, setName] = useState<string>(defaultName);
	const navigate = useNavigate();

	

	const prompt = _id 
		? "Well, well, well. Look who's changing their group's name!"
		: 'Making a new group chat, are we!';

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (accessToken && name.trim()) {
			if (_id) {
				await updateGroup(_id, { name });
			} else {
				await createGroup({ name });
			}

			if (!error) {
				navigate('/groups');
			}
		}
	}

  return (
    <div className="w-full max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{prompt}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            What would you like to name this group?
          </p>
        </div>

        {/* Code Input */}
        <Field>
          <FieldLabel htmlFor="name">Group's name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="e.g the fake friends"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center font-semibold">{error}</p>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button disabled={loading} type="submit" className="w-full">
            {_id 
							? 'Update'
							: 'Create'
						}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default GroupForm