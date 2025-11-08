import { TravelMenu } from "./travel-menu";
import { UserMenu } from "./user-menu";

import type { Travel } from "@/data/travels";
import type { User } from "better-auth";

export const TopBar = ({ travel, user }: { travel: Travel; user: User }) => {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 absolute">
      <TravelMenu travel={travel} />

      <div className="absolute left-0 top-0 w-[72px] h-full bg-white/5 rounded-br-3xl" />

      <div className="flex items-center gap-2">
        <UserMenu user={user} />
      </div>
    </div>
  );
};
