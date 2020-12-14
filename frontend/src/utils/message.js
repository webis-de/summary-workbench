import UIkit from "uikit";

const displayMessage = (message, { status = "danger", pos = "top" } = {}) =>
  UIkit.notification({ message, status, pos });

export { displayMessage };
