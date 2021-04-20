import { FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

const InfoText = ({ messages }) => {
  const element = messages.find(([condition]) => condition);
  if (!element) return null;
  const [, message, urgent] = element;
  return (
    <p className={`uk-text-${urgent ? "danger" : "primary"}`} style={{ marginTop: "-25px" }}>
      {urgent ? <FaInfoCircle /> : <FaExclamationCircle />} {message}
    </p>
  );
};

export { InfoText };
