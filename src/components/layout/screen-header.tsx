import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";
import { useScreenLayoutContext } from "./screen-layout-context";

const TOP_NAV_HEIGHT = 56;

export const ScreenHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { setHeaderHeight } = useScreenLayoutContext();

  useEffect(() => {
    if (headerRef.current) {
      const observer = new ResizeObserver(() => {
        if (headerRef.current) {
          setHeaderHeight(headerRef.current.clientHeight + TOP_NAV_HEIGHT);
        }
      });
      observer.observe(headerRef.current);
      return () => observer.disconnect();
    }
  }, [setHeaderHeight]);

  return (
    <div
      ref={headerRef}
      className={cn(
        "w-full px-5 py-6 dark absolute text-foreground",
        className,
      )}
      style={{
        top: `${TOP_NAV_HEIGHT}px`,
      }}
    >
      {children}
    </div>
  );
};
