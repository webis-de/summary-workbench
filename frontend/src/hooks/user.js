import { useEffect, useReducer, useState } from "react";

import { post } from "../request";

const getLoginStatus = () => Boolean(window.localStorage.getItem("loggedin"));
const setLoginStatus = (status) => window.localStorage.setItem("loggedin", status);

const useUser = () => {
  const [loggedin, setLoggedin] = useReducer((oldState, newState) => {
    setLoginStatus(newState);
    return newState;
  }, getLoginStatus());
  const [accessToken, setAccessToken] = useState(null);
  const updateAccessToken = ({ accesstoken }) => {
    setAccessToken(accesstoken || null);
    if (accesstoken) setLoggedin(true);
    else setLoggedin(false);
    return accesstoken;
  };
  const clearAccessToken = () => updateAccessToken(null);
  useEffect(() => post("/api/user/refresh").then(updateAccessToken).catch(clearAccessToken), []);
  const register = (json) => post("/api/user/register", json).then(updateAccessToken);
  const login = (json) => post("/api/user/login", json).then(updateAccessToken);
  const logout = () => post("/api/user/logout").then(clearAccessToken);
  const refresh = () => post("/api/user/refresh").then(updateAccessToken);
  const auth = (func) => async (...args) => {
    let token = accessToken;
    if (!token) {
      token = await refresh();
    }
    if (token) {
      try {
        return await func(...args, token);
      } catch (error) {
        if (error.type && error.type === "INVALID_TOKEN") {
          token = await refresh();
          if (token) {
            return func(...args, token);
          } else {
            throw new Error("not logged in");
          }
        }
        throw error;
      }
    }
    throw new Error("not logged in");
  };

  return { loggedin, register, login, logout, auth };
};

export { useUser };
