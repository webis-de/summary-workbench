import { FaCode, FaLink } from "react-icons/fa";

const isLink = (text) => text.match(/^https?:\/\//);

const Link = ({ Icon, link, title }) => {
  if (link)
    return (
      <a href={link} title={title}>
        <Icon />
      </a>
    );
  return null;
};

const withIcon = (Icon, title) => (props) => <Link Icon={Icon} title={title} {...props} />;

const SourceCode = withIcon(FaCode, "sourcecode");
const HomePage = withIcon(FaLink, "homepage");

const PluginCard = ({ plugin, inline = true }) => {
  const { name, sourcecode, homepage } = plugin;
  return (
    <div
      style={{
        border: "1px solid black",
        borderRadius: "5px",
        padding: "0",
        display: inline ? "inline-block" : "block",
      }}
    >
      <div
        className="flex justify-between"
        style={{
          alignItems: "center",
          borderBottom: "1px solid black",
          padding: "3px",
          paddingBottom: "0",
          backgroundColor: "#B02F2C",
          color: "white",
        }}
      >
        <div>{name}</div>
        <div className="flex gap-2">
          <SourceCode link={sourcecode} />
          <HomePage link={homepage} />
        </div>
      </div>
      <div style={{ padding: "5px" }}>
        {["type", "model"]
          .filter((propKey) => plugin[propKey])
          .map((propKey) => {
            const propValue = plugin[propKey];
            return (
              <div key={propKey}>
                <span style={{ fontWeight: "bold", marginRight: "10px" }}>{propKey}:</span>
                {isLink(propValue) ? <a href={propValue}>{propKey}</a> : propValue}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export {PluginCard}
