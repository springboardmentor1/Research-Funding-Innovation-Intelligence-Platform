import "../styles/dashboard.css";

function LoadingSpinner() {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p>Loading data...</p>
    </div>
  );
}

export default LoadingSpinner;