function SearchBar() {
    return (

        <div className="search-section">

            <input
                type="text"
                placeholder="Search Research Domain..."
            />

            <select>

                <option>Artificial Intelligence</option>

                <option>Machine Learning</option>

                <option>Healthcare</option>

                <option>Cyber Security</option>

                <option>Robotics</option>

            </select>

            <button>Search</button>

        </div>

    );
}

export default SearchBar;