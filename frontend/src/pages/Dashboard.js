import "../App.css";

import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ProjectCard from "../components/ProjectCard";
import Footer from "../components/Footer";

function Dashboard(){

    return(

        <div className="dashboard">

            <Navbar/>

            <div className="welcome-section">

                <h1>Welcome!</h1>

                <p>

                Search research projects,
                grants and funding opportunities using our AI-powered platform.

                </p>

            </div>

            <SearchBar/>

            <h2 className="section-title">

                Recommended Projects

            </h2>

            <div className="cards">

                <ProjectCard/>

                <ProjectCard/>

                <ProjectCard/>

            </div>

            <Footer/>

        </div>

    );

}

export default Dashboard;