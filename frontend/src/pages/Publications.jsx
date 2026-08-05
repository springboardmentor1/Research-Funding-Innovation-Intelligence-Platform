import CSVLoader from "../components/CSVLoader";
import publications from "../data/publications.csv";

function Publications() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Publications</h1>
      <CSVLoader file={publications} />
    </div>
  );
}

export default Publications;

