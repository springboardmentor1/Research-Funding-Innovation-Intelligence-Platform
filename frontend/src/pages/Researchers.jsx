import CSVLoader from "../components/CSVLoader";
import researchers from "../data/researchers.csv";

function Researchers() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Researchers</h1>
      <CSVLoader file={researchers} />
    </div>
  );
}

export default Researchers;