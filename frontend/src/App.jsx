import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState([]);

  const searchPapers = async () => {

  console.log("Button clicked!");

  try {

    const response = await axios.get(
      `http://127.0.0.1:8000/papers?keyword=${keyword}`
    );

    console.log("Response received:");
    console.log(JSON.stringify(response.data, null, 2));

    setPapers(response.data.results);

  } catch (error) {
  console.log(error.response);
  console.log(error.message);
  console.log(error.code);
}

};

  return (
    <div className="App">

      <h1>
        Research Funding & Innovation Intelligence Platform
      </h1>

      <div className="dashboard">

        <h2>Research Paper Search</h2>

        <div className="search-box">

          <input
            type="text"
            placeholder="Enter keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <button onClick={searchPapers}>
            Search
          </button>

        </div>

        <hr />

        <br />

        {papers.map((paper, index) => (

          <div key={index} className="paper-card">

            <h3>{paper.title}</h3>

            <p>
              <strong>Published:</strong> {paper.published}
            </p>

            <p>
              {paper.summary?.substring(0,250)}...
            </p>

            <hr />

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;