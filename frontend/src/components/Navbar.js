import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <h2>Research Funding Platform</h2>

            <Link to="/" className="logout-btn">
                Logout
            </Link>
        </nav>
    );
}

export default Navbar;