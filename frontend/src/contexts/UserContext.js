import React from "react";

import { useUser } from "../hooks/user";

const UserContext = React.createContext();

const UserProvider = ({ children }) => {
  const user = useUser()
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
export { UserContext, UserProvider };
