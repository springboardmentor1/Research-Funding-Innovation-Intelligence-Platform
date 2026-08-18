import { useState, useEffect } from "react";
import Login from "./Login";
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

  // =========================
  // AUTHENTICATION
  // =========================

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");


  // =========================
  // PAPER SEARCH
  // =========================

  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);


  // =========================
  // ANALYTICS
  // =========================

  const [yearData, setYearData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);


  // =========================
  // GRANT SEARCH
  // =========================

  const [grantKeyword, setGrantKeyword] = useState("");
  const [grants, setGrants] = useState([]);
  const [loadingGrants, setLoadingGrants] = useState(false);


  // =========================
  // PATENT SEARCH
  // =========================

  const [patentKeyword, setPatentKeyword] = useState("");
  const [patents, setPatents] = useState([]);
  const [loadingPatents, setLoadingPatents] = useState(false);


  // =========================
  // STATISTICS
  // =========================

  const [stats, setStats] = useState({
    papers: 0,
    grants: 0,
    patents: 0,
  });


  // =========================
  // LOAD STATISTICS
  // =========================

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


      const years = Object.entries(
        response.data.papers_by_year || {}
      ).map(([year, count]) => ({
        year,
        count,
      }));

      setYearData(years);


      const categories = Object.entries(
        response.data.top_categories || {}
      ).map(([category, count]) => ({
        category,
        count,
      }));

      setCategoryData(categories);

    } catch (error) {

      console.log("Error loading statistics:", error);

    }
  };


  // =========================
  // PAPER SEARCH
  // =========================

  const searchPapers = async () => {

    setSearched(true);
    setLoading(true);

    try {

      const response = await axios.get(
        `http://127.0.0.1:8000/papers?keyword=${keyword}`
      );

      setPapers(response.data.results);

    } catch (error) {

      console.log("Paper search error:", error);

    }

    setLoading(false);
  };


  // =========================
  // GRANT SEARCH
  // =========================

  const searchGrants = async () => {

    setLoadingGrants(true);

    try {

      const response = await axios.get(
        `http://127.0.0.1:8000/grants?keyword=${grantKeyword}`
      );

      setGrants(response.data.results);

    } catch (error) {

      console.log("Grant search error:", error);

    }

    setLoadingGrants(false);
  };


  // =========================
  // PATENT SEARCH
  // =========================

  const searchPatents = async () => {

    setLoadingPatents(true);

    try {

      const response = await axios.get(
        `http://127.0.0.1:8000/patents?keyword=${patentKeyword}`
      );

      setPatents(response.data.results);

    } catch (error) {

      console.log("Patent search error:", error);

    }

    setLoadingPatents(false);
  };


  // =========================
  // LOAD DATA AFTER LOGIN
  // =========================

  useEffect(() => {

    if (loggedIn) {
      loadStats();
    }

  }, [loggedIn]);


  // =========================
  // SHOW LOGIN PAGE
  // =========================

  if (!loggedIn) {

    return (
      <Login
        onLogin={(user) => {
          setUsername(user);
          setLoggedIn(true);
        }}
      />
    );

  }


  // =========================
  // MAIN DASHBOARD
  // =========================

  return (

    <div className="App">

      {/* NAVBAR */}

      <nav className="navbar">

        <h2>RFIIP</h2>

        <ul>
  <li>
    <a href="#home">🏠 Home</a>
  </li>

  <li>
    <a href="#papers">📄 Papers</a>
  </li>

  <li>
    <a href="#grants">💰 Grants</a>
  </li>

  <li>
    <a href="#patents">💡 Patents</a>
  </li>
</ul>

        <div className="user-section">
  👤 {username}

  <button
    onClick={() => {
      setLoggedIn(false);
      setUsername("");
    }}
  >
    Logout
  </button>
</div>

      </nav>


      {/* TITLE */}

      <h1 id="home">
  Research Funding & Innovation Intelligence Platform
</h1>


      {/* STATISTICS */}

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


      {/* =========================
          PAPER SEARCH
      ========================= */}

      <div className="dashboard" id="papers">

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


        {loading && (
          <h3>🔄 Searching papers...</h3>
        )}


        {!loading && searched && papers.length === 0 && (
          <h3>No papers found.</h3>
        )}


        {!loading && papers.map((paper, index) => (

          <div
            key={index}
            className="paper-card"
          >

            <h3>{paper.title}</h3>


            <p>
              <strong>📅 Published:</strong>{" "}
              {paper.published}
            </p>


            <p>
              <strong>🏷 Category:</strong>{" "}
              {paper.primary_category}
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


      {/* =========================
          GRANT SEARCH
      ========================= */}

      <div className="dashboard" id="grants">

  <h2>Research Grant Search</h2>


        <div className="search-box">

          <input
            type="text"
            placeholder="Search grants..."
            value={grantKeyword}
            onChange={(e) =>
              setGrantKeyword(e.target.value)
            }
          />


          <button onClick={searchGrants}>
            Search
          </button>

        </div>


        <br />


        {loadingGrants && (
          <h3>🔄 Searching grants...</h3>
        )}


        {!loadingGrants &&
          grants.length === 0 &&
          grantKeyword && (
            <p>No grants found.</p>
          )}


        {grants.map((grant, index) => (

          <div
            key={index}
            className="paper-card"
          >

            <h3>
              {grant.opportunity_title}
            </h3>


            <p>
              <strong>Agency:</strong>{" "}
              {grant.agency_name}
            </p>


            <p>
              <strong>Category:</strong>{" "}
              {grant.funding_categories}
            </p>


            <p>
              <strong>Close Date:</strong>{" "}
              {grant.close_date}
            </p>


            <p className="summary">
              {grant.summary_description?.substring(
                0,
                250
              )}
              ...
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


      {/* =========================
          PATENT SEARCH
      ========================= */}

      <div className="dashboard" id="patents">

  <h2>Patent Search</h2>


        <div className="search-box">

          <input
            type="text"
            placeholder="Search patents..."
            value={patentKeyword}
            onChange={(e) =>
              setPatentKeyword(e.target.value)
            }
          />


          <button onClick={searchPatents}>
            Search
          </button>

        </div>


        <br />


        {loadingPatents && (
          <h3>🔄 Searching patents...</h3>
        )}


        {!loadingPatents &&
          patents.length === 0 &&
          patentKeyword && (
            <p>No patents found.</p>
          )}


        {patents.map((patent, index) => (

          <div
            key={index}
            className="paper-card"
          >

            <h3>
              {patent.title}
            </h3>


            <p>
              <strong>Assignee:</strong>{" "}
              {patent.assignee}
            </p>


            <p>
              <strong>Inventor:</strong>{" "}
              {patent["inventor/author"]}
            </p>


            <p>
              <strong>Publication Date:</strong>{" "}
              {patent["publication date"]}
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

      </div>


      {/* =========================
          ANALYTICS
      ========================= */}

      <div className="dashboard">

        <h2>Research Analytics</h2>


        <div className="chart-container">

          <h3>Publications by Year</h3>


          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart data={yearData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

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


          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart data={categoryData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

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

    </div>
  );
}


export default App;