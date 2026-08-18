import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import ProjectCard from "../components/ProjectCard";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [searched, setSearched] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const searchProjects = async (searchKeyword) => {
    if (searchKeyword.trim() === "") {
      alert("Please enter a keyword");
      return;
    }

    setKeyword(searchKeyword);
    setSearched(true);
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/search?keyword=${encodeURIComponent(
          searchKeyword
        )}`
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();

      setProjects(data.projects || []);
    } catch (error) {
      console.log(error);
      alert("Unable to connect to backend");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (domain) => {
    if (domain) {
      navigate(`/research?domain=${encodeURIComponent(domain)}`);
    } else {
      navigate("/research");
    }
  };

  const clearSearch = () => {
    setProjects([]);
    setSearched(false);
    setKeyword("");
  };

  return (
    <div className="dashboard">

      <div className="welcome-section">
        <h1>Discover Research. Explore Innovation.</h1>

        <p>
          Search research projects, grants and funding opportunities using our
          intelligent research platform.
        </p>
      </div>

      <SearchBar onSearch={searchProjects} />

      {loading && (
        <div className="loading-message">
          🔍 Searching research projects...
        </div>
      )}

      {!loading && searched && (
        <div className="search-summary">

          <h2 className="section-title">
            Search Results
          </h2>

          <p>
            {projects.length} project
            {projects.length !== 1 ? "s" : ""} found for{" "}
            <strong>"{keyword}"</strong>
          </p>

          <button
            className="clear-btn"
            onClick={clearSearch}
          >
            Clear Search
          </button>

        </div>
      )}

      {!loading && searched && projects.length === 0 && (
        <div className="no-results">
          <h3>No research projects found</h3>

          <p>
            Try another keyword or select a different research domain.
          </p>
        </div>
      )}

      {!searched && (
        <h2 className="section-title">
          Recommended Research Projects
        </h2>
      )}

      {!loading && projects.length > 0 && (
        <div className="cards">

          {projects.map((project, index) => (
            <div
              key={index}
              onClick={() =>
                handleSelectProject(project["Fields of science"])
              }
              style={{ cursor: "pointer" }}
            >

              <ProjectCard
                title={project["Title"]}
                acronym={project["Project acronym"]}
                domain={project["Fields of science"]}
                programme={project["Programmes"]}
                startDate={project["Project start date"]}
                endDate={project["Project end date"]}
                teaser={project["Teaser"]}
                url={project["URL"]}
              />

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Dashboard;