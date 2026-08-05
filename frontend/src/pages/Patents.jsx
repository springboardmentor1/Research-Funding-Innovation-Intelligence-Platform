
import CSVLoader from "../components/CSVLoader";
import patents from "../data/patents.csv";

function Patents() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Patents</h1>
      <CSVLoader file={patents} />
    </div>
  );
}

export default Patents;