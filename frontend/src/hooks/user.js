import { useCallback, useEffect, useReducer, useRef } from "react";

import { post } from "../request";

const getLoginStatus = () => JSON.parse(window.localStorage.getItem("loggedin"));
const setLoginStatus = (status) => window.localStorage.setItem("loggedin", status);

const useUser = () => {
  const [loggedin, setLoggedin] = useReducer((oldState, newState) => {
    setLoginStatus(newState);
    return newState;
  }, getLoginStatus());
  const accessToken = useRef(null);
  const refreshRequest = useRef(null);
  const updateAccessToken = useCallback(
    ({ accesstoken }) => {
      accessToken.current = accesstoken;
      if (accesstoken) setLoggedin(true);
      else setLoggedin(false);
    },
    [setLoggedin]
  );
  const clearAccessToken = useCallback(() => updateAccessToken({ accesstoken: null }), [
    updateAccessToken,
  ]);
  const register = useCallback((json) => post("/api/user/register", json).then(updateAccessToken), [
    updateAccessToken,
  ]);
  const login = useCallback((json) => post("/api/user/login", json).then(updateAccessToken), [
    updateAccessToken,
  ]);
  const logout = useCallback(() => post("/api/user/logout").then(clearAccessToken), [
    clearAccessToken,
  ]);
  const refresh = useCallback(() => {
    refreshRequest.current = post("/api/user/refresh")
      .then(updateAccessToken)
      .catch(clearAccessToken);
  }, [updateAccessToken, clearAccessToken]);
  const getToken = useCallback(async () => {
    if (!refreshRequest.current) refresh();
    await refreshRequest.current;
    if (accessToken.current === null) throw new Error("not logged in");
    return accessToken.current;
  }, [refresh]);
  useEffect(() => !refreshRequest.current && refresh(), [refresh]);
  const auth = useCallback(
    (func) => async (...args) => {
      let token = await getToken();
      try {
        return await func(...args, token);
      } catch (error) {
        if (error.type && error.type === "INVALID_TOKEN") {
          refresh();
          token = await getToken();
          return func(...args, token);
        }
        throw error;
      }
    },
    [getToken, refresh]
  );

  return { loggedin, register, login, logout, auth };
};

export { useUser };
