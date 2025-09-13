import { Cog, Home, List, Ruler, ScanQrCode } from "lucide-react";
import { NavigationButton } from "./navigation-button";
import { useState } from "react";

const navItems = [
  { icon: Home, active: true },
  { icon: List },
  { icon: ScanQrCode },
  { icon: Ruler },
  { icon: Cog },
];

export const NavBar = () => {
  // const location = useRouterState({ select: (s) => s.location });
  const [activeIndex, setActiveIndex] = useState(0);
  const onClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <nav
      role="navigation"
      aria-label="navigation"
      data-slot="navigation"
      className="w-full py-5 px-6 rounded-t-2xl shadow-up flex items-center justify-between fixed bottom-0 bg-white"
    >
      {navItems.map((item, index) => (
        <NavigationButton
          key={index}
          icon={item.icon}
          active={index === activeIndex}
          onClick={() => onClick(index)}
        />
      ))}
    </nav>
  );
};
