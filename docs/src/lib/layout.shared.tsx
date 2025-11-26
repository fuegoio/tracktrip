import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ArrowRight } from "lucide-react";

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: false,
    },
    nav: {
      title: (
        <div className="flex items-center font-semibold gap-2 md:px-2">
          <div className="size-4 rounded-full bg-white bg-primary" />
          Tracktrip
        </div>
      ),
      url: "https://tracktrip.app",
    },
    searchToggle: {
      enabled: false,
    },
    links: [
      {
        on: "nav",
        type: "main",
        icon: <ArrowRight />,
        url: "https://tracktrip.app/travels",
        text: "My travels",
      },
    ],
  };
}
