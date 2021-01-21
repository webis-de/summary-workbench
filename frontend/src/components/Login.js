import React, { useContext, useState } from "react";
import { FaInfoCircle, FaSignInAlt, FaSignOutAlt, FaTimes } from "react-icons/fa";

import { UserContext } from "../contexts/UserContext";
import { useKeycode } from "../hooks/keycode";
import { displayMessage } from "../utils/message";
import { Button } from "./utils/Button";
import { Loading } from "./utils/Loading";
import { Modal } from "./utils/Modal";
import { TabContent, TabHead, TabItem } from "./utils/Tabs";

const Login = ({ isVisible, close }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [infoText, setInfoText] = useState(null);
  const { login } = useContext(UserContext);
  const accept = () =>
    login({ email, password })
      .then(() => close())
      .catch((err) => setInfoText(err.error));
  useKeycode([13], accept, isVisible);
  return (
    <div>
      <input
        type="email"
        className="uk-input"
        placeholder="E-mail"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="uk-input uk-margin-top"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      {infoText && (
        <div className="uk-margin-top uk-text-primary">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      <Button
        variant="primary"
        className="uk-margin-top"
        style={{ float: "right" }}
        onClick={accept}
      >
        Login
      </Button>
    </div>
  );
};

const Register = ({ isVisible, close }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const { register } = useContext(UserContext);
  const accept = () => {
    if (!username) {
      setInfoText("username is missing");
      return;
    }
    if (!email) {
      setInfoText("email is missing");
      return;
    }
    if (password !== confirmPassword) {
      setInfoText("entered passwords are not the same");
      return;
    }
    setLoading(true);
    register({ username, email, password })
      .then(() => close())
      .catch(() => setInfoText(`could not register (maybe user already exists)`))
      .finally(() => setLoading(false));
  };
  useKeycode([13], accept, isVisible);
  return (
    <div>
      <input
        type="text"
        className="uk-input"
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        className="uk-input uk-margin-top"
        placeholder="E-mail"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="uk-input uk-margin-top"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        className="uk-input uk-margin-top"
        placeholder="confirm password"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {infoText && (
        <div className="uk-margin-top uk-text-primary">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      {isLoading ? (
        <Loading style={{ float: "right" }} />
      ) : (
        <Button
          variant="primary"
          className="uk-margin-top"
          style={{ float: "right" }}
          onClick={accept}
        >
          Register
        </Button>
      )}
    </div>
  );
};

const LoginModal = ({ isOpen, setIsOpen }) => {
  const close = () => setIsOpen(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
      <a
        href="/#"
        onClick={(e) => {
          e.preventDefault();
          close();
        }}
        style={{
          color: "#888",
          position: "absolute",
          right: 0,
          top: 0,
          transform: "translate(-30%, 10%)",
        }}
      >
        <FaTimes style={{ width: "20px" }} />
      </a>
      <TabHead tabs={["Login", "Register"]} setActiveTab={setActiveTab} />
      <TabContent>
        <TabItem>
          <Login isVisible={activeTab === 0} close={close} />
        </TabItem>
        <TabItem>
          <Register isVisible={activeTab === 1} close={close} />
        </TabItem>
      </TabContent>
    </Modal>
  );
};

const LoginButton = ({ className, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={className} style={style}>
      <a
        href="/#"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <FaSignInAlt style={{ width: "20px", marginRight: "5px" }} /> Login
      </a>
      {isOpen && <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />}
    </div>
  );
};

const LogoutButton = ({ className, style }) => {
  const { logout } = useContext(UserContext);
  return (
    <div className={className} style={style}>
      <a
        href="/#"
        onClick={(e) => {
          e.preventDefault();
          logout().then(() => displayMessage("logout successfull"));
        }}
      >
        <FaSignOutAlt style={{ width: "20px", marginRight: "5px" }} /> Logout
      </a>
    </div>
  );
};

export { LoginButton, LogoutButton };
