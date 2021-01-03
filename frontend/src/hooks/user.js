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
    setAccessToken(accesstoken);
    setLoggedin(true);
    return accesstoken;
  };
  const clearAccessToken = () => {
    setAccessToken(null);
    setLoggedin(false);
  };
  useEffect(() => post("/api/user/refresh").then(updateAccessToken).catch(clearAccessToken), []);
  const register = (json) => post("/api/user/register", json).then(updateAccessToken);
  const login = (json) => post("/api/user/login", json).then(updateAccessToken);
  const logout = () => post("/api/user/logout").then(clearAccessToken);
  const refresh = () => post("/api/user/refresh").then(updateAccessToken);
  const authPost = async (path, json) => {
    try {
      return await post(path, json, accessToken);
    } catch (error) {
      const token = await refresh();
      return post(path, json, token);
    }
  };

  return { loggedin, register, login, logout, authPost };
};

export { useUser };
