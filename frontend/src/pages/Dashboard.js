import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Added import

import SearchBar from "../components/SearchBar";
import ProjectCard from "../components/ProjectCard";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate(); // 2. Initialized navigate hook

  const searchProjects = async (keyword) => {
    if (keyword.trim() === "") {
      alert("Please enter a keyword");
      return;
    }

    try {
      setSearched(true);

      const response = await fetch(
        `http://127.0.0.1:5000/search?keyword=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.log(error);
      alert("Unable to connect to backend");
    }
  };

  // 3. Added handler to redirect to research page with selected domain/keyword
  const handleSelectProject = (domain) => {
    if (domain) {
      navigate(`/research?domain=${encodeURIComponent(domain)}`);
    } else {
      navigate('/research');
    }
  };

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>Welcome!</h1>
        <p>
          Search research projects, grants and funding opportunities using our
          AI-powered platform.
        </p>
      </div>

      <SearchBar onSearch={searchProjects} />

      <h2 className="section-title">
        {searched ? "Search Results" : "Recommended Research Projects"}
      </h2>

      {searched && projects.length === 0 && (
        <p className="no-results">No research projects found.</p>
      )}

      <div className="cards">
        {projects.map((project, index) => (
          <div 
            key={index} 
            onClick={() => handleSelectProject(project["Fields of science"])}
            style={{ cursor: 'pointer' }}
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
    </div>
  );
}

export default Dashboard;