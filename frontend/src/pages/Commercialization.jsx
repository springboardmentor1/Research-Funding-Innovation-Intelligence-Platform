import CSVLoader from "../components/CSVLoader";
import patents from "../data/patents.csv";

function Commercialization() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Commercialization Recommendations</h1>

      <p style={{ marginBottom: "20px" }}>
        The following patents have commercialization potential:
      </p>

      <CSVLoader file={patents} />
    </div>
  );
}

export default Commercialization;