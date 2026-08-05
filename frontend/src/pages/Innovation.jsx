import CSVLoader from "../components/CSVLoader";
import patents from "../data/patents.csv";

function Innovation() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Innovation Scoring</h1>
      <CSVLoader file={patents} />
    </div>
  );
}

export default Innovation;