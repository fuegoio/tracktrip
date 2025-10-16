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
    .match(/(\b\S)?/g)
    .join("")
    .match(/(^\S|\S$)?/g)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={cn("size-6", className)} {...props}>
      <AvatarImage src={user.image ?? ""} alt={user.name} />
      <AvatarFallback className="text-[0.5rem]">{initials}</AvatarFallback>
    </Avatar>
  );
};
