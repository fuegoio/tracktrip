import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import type { Travel } from "@/data/travels";
import { useState } from "react";

export const UsersDropdown = ({
  travel,
  value,
  onChange,
}: {
  travel: Travel;
  value?: string[] | null;
  onChange: (value: string[] | null) => void;
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    value ?? travel.users.map((user) => user.id),
  );

  const handleCheckedChange = ({
    checked,
    userId,
  }: {
    checked: boolean;
    userId: string;
  }) => {
    const newSelectedUsers = [...selectedUsers];
    if (checked) {
      newSelectedUsers.push(userId);
    } else {
      newSelectedUsers.splice(newSelectedUsers.indexOf(userId), 1);
    }

    setSelectedUsers(newSelectedUsers);
    onChange(newSelectedUsers.length === 0 ? null : newSelectedUsers);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="font-normal min-w-0 px-4"
        >
          <span className="truncate min-w-0">
            {selectedUsers.length === travel.users.length && "Everyone"}

            {selectedUsers.length === 1 &&
              travel.users.length > 1 &&
              travel.users.find((user) => user.id === selectedUsers[0])?.name}

            {selectedUsers.length > 1 &&
            selectedUsers.length < travel.users.length
              ? `${selectedUsers.length} people`
              : ""}

            {selectedUsers.length === 0 && "No one"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Who benefited from this?</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {travel.users.map((user) => (
          <DropdownMenuCheckboxItem
            key={user.id}
            checked={selectedUsers.includes(user.id)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) =>
              handleCheckedChange({ checked, userId: user.id })
            }
          >
            {user.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
