import { Hint } from "./Text";

const Error = ({ error: { message } }) => (
  <Hint key={message} type="danger" small>
    {message}
  </Hint>
);

const MultipleError = ({ error }) =>
  error.map(({ name, errors }) => (
    <Hint key={name} type="danger" small>
      <div>{name}:</div>
      <div className="ml-5">
        {errors.map(({ message }, i) => (
          <div key={i}>{message}</div>
        ))}
      </div>
    </Hint>
  ));

const Errors = ({ errors }) =>
  errors.map((error) =>
    error.type === "MULTIPLE" ? <MultipleError error={error.errors} /> : <Error error={error} />
  );
export { Errors };
