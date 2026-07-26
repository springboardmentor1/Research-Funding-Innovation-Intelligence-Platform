import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function App() {

  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [yearData, setYearData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [grantKeyword, setGrantKeyword] = useState("");
  const [grants, setGrants] = useState([]);
  const [loadingGrants, setLoadingGrants] = useState(false);
  const [patentKeyword, setPatentKeyword] = useState("");
  const [patents, setPatents] = useState([]);
  const [loadingPatents, setLoadingPatents] = useState(false);


  const [stats, setStats] = useState({
  papers: 0,
  grants: 0,
  patents: 0,
});

  const loadStats = async () => {

  try {

    const response = await axios.get(
      "http://127.0.0.1:8000/stats"
    );

    setStats({
      papers: response.data.papers,
      grants: response.data.grants,
      patents: response.data.patents,
    });

    const years = Object.entries(response.data.papers_by_year).map(
      ([year, count]) => ({
        year,
        count,
      })
    );

    setYearData(years);

    const categories = Object.entries(response.data.top_categories).map(
      ([category, count]) => ({
        category,
        count,
      })
    );

    setCategoryData(categories);

  } catch (error) {
    console.log(error);
  }
};

  const searchPapers = async () => {
    setSearched(true);
    setLoading(true);

    try{

      const response = await axios.get(
          `http://127.0.0.1:8000/papers?keyword=${keyword}`
      );

      setPapers(response.data.results);

  }
  catch(error){
      console.log(error);
  }

  setLoading(false);

};

const searchGrants = async () => {

  setLoadingGrants(true);

  try {

    const response = await axios.get(
      `http://127.0.0.1:8000/grants?keyword=${grantKeyword}`
    );

    setGrants(response.data.results);

  } catch (error) {

    console.log(error);

  }

  setLoadingGrants(false);

};

const searchPatents = async () => {

  setLoadingPatents(true);

  try {

    const response = await axios.get(
      `http://127.0.0.1:8000/patents?keyword=${patentKeyword}`
    );

    setPatents(response.data.results);

  } catch (error) {

    console.log(error);

  }

  setLoadingPatents(false);

};

  useEffect(() => {
  loadStats();
}, []);

  return (
  <div className="App">

    <nav className="navbar">
      <h2>RFIIP</h2>

      <ul>
        <li>🏠 Home</li>
        <li>📄 Papers</li>
        <li>💰 Grants</li>
        <li>💡 Patents</li>
      </ul>
    </nav>

    <h1>
      Research Funding & Innovation Intelligence Platform
    </h1>

    <div className="stats-container">

      <div className="stat-card papers">
        <h3>📄 Research Papers</h3>
        <h2>{stats.papers}</h2>
      </div>

      <div className="stat-card grants">
        <h3>💰 Grants</h3>
        <h2>{stats.grants}</h2>
      </div>

      <div className="stat-card patents">
        <h3>💡 Patents</h3>
        <h2>{stats.patents}</h2>
      </div>

    </div>

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

      {/* Loading Message */}
      {loading && (
        <h3>🔄 Searching papers...</h3>
      )}

      {/* No Results Message */}
      {!loading && searched && papers.length === 0 && (
        <h3>No papers found.</h3>
      )}

      {/* Paper Results */}
      {!loading &&
        papers.map((paper, index) => (

          <div key={index} className="paper-card">

            <h3>{paper.title}</h3>

            <p>
              <strong>📅 Published:</strong> {paper.published}
            </p>

            <p>
              <strong>🏷 Category:</strong> {paper.primary_category}
            </p>

            <p className="summary">
              {paper.summary?.substring(0, 300)}...
            </p>

            {paper.pdf_url && (
              <a
                href={paper.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="pdf-button"
              >
                📄 View Paper
              </a>
            )}

          </div>

      ))}

    </div>

    <div className="dashboard">

  <h2>Research Grant Search</h2>

  <div className="search-box">

    <input
      type="text"
      placeholder="Search grants..."
      value={grantKeyword}
      onChange={(e) => setGrantKeyword(e.target.value)}
    />

    <button onClick={searchGrants}>
      Search
    </button>

  </div>

  <br />

  {loadingGrants && <h3>Searching Grants...</h3>}

  {!loadingGrants && grants.length === 0 && (
    <p>No grants found.</p>
  )}

  {grants.map((grant, index) => (

    <div key={index} className="paper-card">

      <h3>{grant.opportunity_title}</h3>

      <p>
        <strong>Agency:</strong> {grant.agency_name}
      </p>

      <p>
        <strong>Category:</strong> {grant.funding_categories}
      </p>

      <p>
        <strong>Close Date:</strong> {grant.close_date}
      </p>

      <p className="summary">
        {grant.summary_description?.substring(0,250)}...
      </p>

      {grant.url && (
        <a
          href={grant.url}
          target="_blank"
          rel="noreferrer"
          className="pdf-button"
        >
          🔗 View Grant
        </a>
      )}

    </div>

  ))}

</div>

  <h2>Patent Search</h2>

  <div className="search-box">

    <input
      type="text"
      placeholder="Search patents..."
      value={patentKeyword}
      onChange={(e) => setPatentKeyword(e.target.value)}
    />

    <button onClick={searchPatents}>
      Search
    </button>

  </div>

  <br />

  {loadingPatents && <h3>Searching Patents...</h3>}

  {!loadingPatents && patents.length === 0 && (
    <p>No patents found.</p>
  )}

  {patents.map((patent, index) => (

    <div key={index} className="paper-card">

      <h3>{patent.title}</h3>

      <p>
        <strong>Assignee:</strong> {patent.assignee}
      </p>

      <p>
        <strong>Inventor:</strong> {patent["inventor/author"]}
      </p>

      <p>
        <strong>Publication Date:</strong> {patent["publication date"]}
      </p>

      {patent["result link"] && (
        <a
          href={patent["result link"]}
          target="_blank"
          rel="noreferrer"
          className="pdf-button"
        >
          🔗 View Patent
        </a>
      )}

    </div>

  ))}
    <h2>Research Analytics</h2>

<div className="chart-container">

  <h3>Publications by Year</h3>

  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={yearData}>

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="year" />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="count"
        fill="#2563eb"
      />

    </BarChart>
  </ResponsiveContainer>

  <h3>Top Research Categories</h3>

  <ResponsiveContainer width="100%" height={350}>

    <BarChart data={categoryData}>

      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="category" />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="count"
        fill="#16a34a"
      />

    </BarChart>

  </ResponsiveContainer>

</div>

  </div>
);
}

export default App;