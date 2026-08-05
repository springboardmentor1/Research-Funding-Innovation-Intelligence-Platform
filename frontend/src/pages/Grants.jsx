import CSVLoader from "../components/CSVLoader";
import grants from "../data/grants.csv";

function Grants() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Grants</h1>
      <CSVLoader file={grants} />
    </div>
  );
}

export default Grants;