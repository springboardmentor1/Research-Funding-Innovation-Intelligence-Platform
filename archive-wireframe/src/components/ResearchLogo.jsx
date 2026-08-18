import logo from "../assets/research-logo.png";

function ResearchLogo({ size = 90 }) {
  return (
    <img
      src={logo}
      alt="Research Innovation Logo"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

export default ResearchLogo;