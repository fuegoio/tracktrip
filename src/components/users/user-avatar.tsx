import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { cn } from "@/lib/utils";

export const UserAvatar = ({
  user,
  className,
  ...props
}: {
  user: {
    name: string;
    image?: string | null;
  };
  className?: string;
}) => {
  const initials = user.name
    .match(/(\b\S)?/g)!
    .join("")
    .match(/(^\S|\S$)?/g)!
    .join("")
    .toUpperCase();

  return (
    <Avatar className={cn("size-7", className)} {...props}>
      <AvatarImage src={user.image ?? ""} alt={user.name} />
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
  );
};
