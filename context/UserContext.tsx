import { createContext } from "react";

type User = {
  username: string;
  moodToday?: string;
  coins: number;
};

type UserContextType = {
  user: User;
  setUser: (u: User) => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
};

export const UserContext = createContext<UserContextType>({
  user: { username: "", coins: 0 },
  setUser: () => {},
  showWelcome: true,
  setShowWelcome: () => {},
});
