import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { useScreenLayoutContext } from "./screen-layout-context";

export const ScreenDrawer = ({
  children,
  className,
  asChild,
}: {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}) => {
  const { headerHeight } = useScreenLayoutContext();

  return (
    <div
      className="overflow-y-auto h-full flex flex-col"
      style={{
        paddingTop: `${headerHeight}px`,
      }}
    >
      {asChild ? (
        children
      ) : (
        <div
          className={cn(
            "rounded-t-lg bg-background shadow-up translate-y-0 pt-4 pb-20 px-2 flex-1",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
