import { useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { loadMoodDate, saveMoodDate } from "../services/storage";

type User = {
  username: string;
  moodToday?: string;
  coins: number;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>({ username: "", coins: 0 });
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  useEffect(() => {
    const checkMoodToday = async () => {
      const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
      const lastMoodDate = await loadMoodDate();

      if (lastMoodDate === today) {
        setShowWelcome(false);
      } else {
        setShowWelcome(true);
      }
    };

    checkMoodToday();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        showWelcome,
        setShowWelcome,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
