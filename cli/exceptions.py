from termcolor import colored


class BaseManageError(Exception):
    def __init__(self, messages, origin=None):
        super().__init__()
        self.messages = messages
        self.origin = origin

    def print(self):
        messages = self.messages
        origin = self.origin
        if isinstance(messages, str):
            converted = [[messages, origin]]
        elif hasattr(messages, "__iter__"):
            converted = []
            for message in messages:
                if isinstance(messages, str):
                    converted.append([message, origin])
                else:
                    converted.append(message)

        for message, origin in converted:
            origin = (
                "" if origin is None else colored(f"{origin}: ", "red", attrs=["bold"])
            )
            message = colored(message, "red")
            print(f"{origin}{message}")


class InvalidPathError(BaseManageError):
    pass


class InvalidYamlError(BaseManageError):
    pass


class InvalidGitLinkError(BaseManageError):
    pass


class InvalidPluginTypeError(BaseManageError):
    pass


class DockerUsernameRequiredError(BaseManageError):
    pass


class DockerNotRunningError(BaseManageError):
    pass


class DoubleServicesError(BaseManageError):
    pass


class ModelValidationError(BaseManageError):
    def print(self):
        origin = self.origin
        print(
            colored(
                f"Validating {origin} failed with the following errors:",
                "red",
                attrs=["bold"],
            )
        )
        for error in self.messages:
            error_path = " -> ".join(map(str, error["loc"]))
            print(colored(f"  {error_path}", "red"))
            print(colored(f"    {error['msg']}", "red"))
