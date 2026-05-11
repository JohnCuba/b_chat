import { signal } from "@preact/signals";
import { type VNode, createContext } from "preact";
import { useContext } from "preact/hooks";

type AppContextType = {
  navRight: ReturnType<typeof signal<VNode<any> | null>>;
};

export const appContextValue: AppContextType = {
  navRight: signal<VNode<any> | null>(null),
};

export const AppContext = createContext<AppContextType>(appContextValue);

export const useAppContext = () => useContext(AppContext);
