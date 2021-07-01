import UIkit from "uikit";

const displayMessage = (message, { status = "danger", pos = "top" } = {}) =>
  UIkit.notification({ message, status, pos });

const displayError = (e) => {
  console.log(e)
  displayMessage(e.message)
}

export { displayMessage, displayError };
