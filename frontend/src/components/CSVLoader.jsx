import { useState, useEffect } from "react";
import Papa from "papaparse";

function CSVLoader({ file }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse(file, {
      header: true,
      download: false,
      skipEmptyLines: true,
      complete: (results) => {
        console.log(results.data);
        setData(results.data);
      },
    });
  }, [file]);

  return (
    <div
      style={{
        marginTop: "20px",
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3>CSV Data</h3>

      {data.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    background: "#2563eb",
                    color: "#fff",
                  }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td
                    key={i}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading CSV...</p>
      )}
    </div>
  );
}

export default CSVLoader;