import { HeadingMedium, Hint } from "./Text";

const ErrorBox = ({ children }) => (
  <div>
    <HeadingMedium>Errors</HeadingMedium>
    <div className="border p-2 max-h-[200px] overflow-y-scroll">{children}</div>
  </div>
);

const Errors = ({ errors, nested, type = "danger" }) => {
  if (Array.isArray(errors)) {
    return errors.map((err, i) => <Errors key={i} errors={err} nested={nested} type={type} />);
  }

  const { name, message } = errors;

  let subErrors;
  if (typeof errors === "string") subErrors = errors;
  else {
    subErrors = errors.errors;
    if (subErrors === undefined) {
      if (message === undefined) throw new Error("either 'errors' or 'message' needs to be set");
      subErrors = message;
    }
  }

  let inner;
  if (typeof subErrors === "string") inner = <div>{subErrors}</div>;
  else inner = <Errors errors={subErrors} nested type={type} />;

  if (name !== undefined) {
    inner = (
      <>
        <div>{name}:</div>
        <div className="ml-5">{inner}</div>
      </>
    );
  }

  if (nested) inner = <div>{inner}</div>;
  else
    inner = (
      <Hint type={type} small>
        {inner}
      </Hint>
    );

  return inner;
};

export { Errors, ErrorBox };
