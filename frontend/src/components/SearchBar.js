import { useState } from "react";

function SearchBar({ onSearch }) {

    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        onSearch(keyword);
    };

    return (

        <div className="search-section">

            <input
                type="text"
                placeholder="Search Research Domain..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />

            <select
                onChange={(e) => setKeyword(e.target.value)}
            >

                <option value="">Select Domain</option>

                <option value="Artificial Intelligence">
                    Artificial Intelligence
                </option>

                <option value="Machine Learning">
                    Machine Learning
                </option>

                <option value="Healthcare">
                    Healthcare
                </option>

                <option value="Cyber Security">
                    Cyber Security
                </option>

                <option value="Robotics">
                    Robotics
                </option>

            </select>

            <button onClick={handleSearch}>
                Search
            </button>

        </div>

    );
}

export default SearchBar;