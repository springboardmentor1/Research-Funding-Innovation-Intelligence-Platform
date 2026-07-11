import "./../styles/Hero.css";

function Hero() {
  return (
    <section className="hero">

      <h1>
        AI Research Funding &
        <br />
        Innovation Intelligence Platform
      </h1>

      <p>
        Discover Research Papers, Funding Opportunities,
        Patents and Researchers in one place.
      </p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search Research Papers..."
        />

        <button>Search</button>
      </div>

      <div className="hero-buttons">
        <button className="primary">
          Explore Research
        </button>

        <button className="secondary">
          Find Funding
        </button>
      </div>

    </section>
  );
}

export default Hero;