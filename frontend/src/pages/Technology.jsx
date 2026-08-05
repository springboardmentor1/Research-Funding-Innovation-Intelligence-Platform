import CSVLoader from "../components/CSVLoader";
import patents from "../data/patents.csv";

function Technology() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Technology Intelligence</h1>
      <CSVLoader file={patents} />
    </div>
  );
}

export default Technology;