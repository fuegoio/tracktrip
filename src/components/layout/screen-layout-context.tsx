import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

const ScreenLayoutContext = createContext<{
  headerHeight: number;
  setHeaderHeight: (value: number) => void;
}>({
  headerHeight: 0,
  setHeaderHeight: () => {},
});

const ScreenLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <ScreenLayoutContext.Provider value={{ headerHeight, setHeaderHeight }}>
      {children}
    </ScreenLayoutContext.Provider>
  );
};

const useScreenLayoutContext = () => {
  const ref = useContext(ScreenLayoutContext);
  if (!ref) {
    throw new Error("useScreenLayoutContext must be used within a RefProvider");
  }
  return ref;
};

export { ScreenLayoutProvider, useScreenLayoutContext };
