import { useState, useContext, useEffect, useRef } from "react";
import { searchAll } from "../api/searchApi";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { SearchContext } from "../context/SearchContext";

function Search() {
  const { search } = useContext(SearchContext);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Selected category
  const [selectedCategory, setSelectedCategory] = useState("all");

  // References for scrolling
  const publicationsRef = useRef(null);
  const fundingRef = useRef(null);
  const patentsRef = useRef(null);
  const organizationsRef = useRef(null);
  const researchersRef = useRef(null);

  /* =====================================================
     SEARCH
  ===================================================== */

  useEffect(() => {
    const query = search?.trim();

    if (!query) {
      setResults(null);
      setLoading(false);
      setError(false);
      setSelectedCategory("all");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(false);

        console.log("Searching for:", query);

        const data = await searchAll(
          query,
          controller.signal
        );

        setResults(data);

        // Show all categories after a new search
        setSelectedCategory("all");

      } catch (error) {

        // Ignore cancelled requests
        if (error.name === "AbortError") {
          return;
        }

        console.error("Search Error:", error);

        setError(true);
        setResults(null);

      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };

  }, [search]);


  /* =====================================================
     CATEGORY CLICK
  ===================================================== */

  const handleCategoryClick = (category, sectionRef) => {

    setSelectedCategory(category);

    // Wait for React to update the UI
    setTimeout(() => {

      sectionRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }, 100);

  };


  /* =====================================================
     CHECK CATEGORY VISIBILITY
  ===================================================== */

  const showCategory = (category) => {
    return (
      selectedCategory === "all" ||
      selectedCategory === category
    );
  };


  return (
    <Layout>

      <div style={{ padding: "30px" }}>

        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <h1>
          🔍 Global Research Search
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginTop: "10px",
            fontSize: "16px",
          }}
        >
          Showing results for:

          <strong>
            {" "}
            {search || "Nothing searched yet"}
          </strong>
        </p>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div style={{ marginTop: "40px" }}>
            <LoadingSpinner />
          </div>
        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (

          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #ddd",
            }}
          >

            <h2>
              ⚠️ Search Failed
            </h2>

            <p
              style={{
                marginTop: "10px",
                color: "#6b7280",
              }}
            >
              Unable to load search results.
              Please try again.
            </p>

          </div>
        )}


        {/* =================================================
            RESULTS
        ================================================= */}

        {!loading && !error && results && (

          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: "15px",
                marginTop: "30px",
                marginBottom: "40px",
              }}
            >

              <SummaryCard
                title="📚 Publications"
                count={results.publications?.length || 0}
                active={selectedCategory === "publications"}
                onClick={() =>
                  handleCategoryClick(
                    "publications",
                    publicationsRef
                  )
                }
              />


              <SummaryCard
                title="💰 Funding"
                count={results.funding?.length || 0}
                active={selectedCategory === "funding"}
                onClick={() =>
                  handleCategoryClick(
                    "funding",
                    fundingRef
                  )
                }
              />


              <SummaryCard
                title="📜 Patents"
                count={results.patents?.length || 0}
                active={selectedCategory === "patents"}
                onClick={() =>
                  handleCategoryClick(
                    "patents",
                    patentsRef
                  )
                }
              />


              <SummaryCard
                title="🏢 Organizations"
                count={results.organizations?.length || 0}
                active={
                  selectedCategory === "organizations"
                }
                onClick={() =>
                  handleCategoryClick(
                    "organizations",
                    organizationsRef
                  )
                }
              />


              <SummaryCard
                title="👨‍🔬 Researchers"
                count={results.researchers?.length || 0}
                active={
                  selectedCategory === "researchers"
                }
                onClick={() =>
                  handleCategoryClick(
                    "researchers",
                    researchersRef
                  )
                }
              />

            </div>


            {/* =================================================
                SHOW ALL BUTTON
            ================================================= */}

            {selectedCategory !== "all" && (

              <button
                onClick={() => setSelectedCategory("all")}
                style={{
                  marginBottom: "25px",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#111111",
                  color: "#DFFF00",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ← Show All Results
              </button>

            )}


            {/* =================================================
                PUBLICATIONS
            ================================================= */}

            {showCategory("publications") && (

              <section ref={publicationsRef}>

                <SectionTitle title="📚 Publications" />

                {!results.publications ||
                results.publications.length === 0 ? (

                  <EmptyMessage text="No publications found." />

                ) : (

                  results.publications.map(
                    (item, index) => (

                      <Card key={index}>

                        <h3>
                          {item.title || "Untitled Publication"}
                        </h3>

                        <p>
                          <strong>
                            Year:
                          </strong>{" "}
                          {item.publication_year || "N/A"}
                        </p>

                        <p>
                          <strong>
                            Type:
                          </strong>{" "}
                          {item.type || "N/A"}
                        </p>

                      </Card>
                    )
                  )

                )}

              </section>
            )}


            {/* =================================================
                FUNDING
            ================================================= */}

            {showCategory("funding") && (

              <section ref={fundingRef}>

                <SectionTitle title="💰 Funding" />

                {!results.funding ||
                results.funding.length === 0 ? (

                  <EmptyMessage text="No funding found." />

                ) : (

                  results.funding.map(
                    (item, index) => (

                      <Card key={index}>

                        <h3>
                          {item.project_title ||
                            "Untitled Project"}
                        </h3>

                        <p>
                          <strong>
                            Organization:
                          </strong>{" "}
                          {item.organization || "N/A"}
                        </p>

                        <p>
                          <strong>
                            Principal Investigator:
                          </strong>{" "}
                          {item.principal_investigator ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Fiscal Year:
                          </strong>{" "}
                          {item.fiscal_year || "N/A"}
                        </p>

                      </Card>
                    )
                  )

                )}

              </section>
            )}


            {/* =================================================
                PATENTS
            ================================================= */}

            {showCategory("patents") && (

              <section ref={patentsRef}>

                <SectionTitle title="📜 Patents" />

                {!results.patents ||
                results.patents.length === 0 ? (

                  <EmptyMessage text="No patents found." />

                ) : (

                  results.patents.map(
                    (item, index) => (

                      <Card key={index}>

                        <h3>
                          {item.Title ||
                            "Untitled Patent"}
                        </h3>

                        <p>
                          <strong>
                            Publication No:
                          </strong>{" "}
                          {item["Publication Number"] ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Inventor:
                          </strong>{" "}
                          {item["Inventor Name"] ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Applicant:
                          </strong>{" "}
                          {item["Applicant Name"] ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Country:
                          </strong>{" "}
                          {String(
                            item["Applicant Country"] || ""
                          ).replace(/#/g, "") ||
                            "N/A"}
                        </p>

                      </Card>
                    )
                  )

                )}

              </section>
            )}


            {/* =================================================
                ORGANIZATIONS
            ================================================= */}

            {showCategory("organizations") && (

              <section ref={organizationsRef}>

                <SectionTitle title="🏢 Organizations" />

                {!results.organizations ||
                results.organizations.length === 0 ? (

                  <EmptyMessage text="No organizations found." />

                ) : (

                  results.organizations.map(
                    (item, index) => (

                      <Card key={index}>

                        <h3>
                          {item.organization_name ||
                            "Unknown Organization"}
                        </h3>

                        <p>
                          <strong>
                            Country:
                          </strong>{" "}
                          {item.country || "N/A"}
                        </p>

                        <p>
                          <strong>
                            Type:
                          </strong>{" "}
                          {item.type || "N/A"}
                        </p>

                      </Card>
                    )
                  )

                )}

              </section>
            )}


            {/* =================================================
                RESEARCHERS
            ================================================= */}

            {showCategory("researchers") && (

              <section ref={researchersRef}>

                <SectionTitle title="👨‍🔬 Researchers" />

                {!results.researchers ||
                results.researchers.length === 0 ? (

                  <EmptyMessage text="No researchers found." />

                ) : (

                  results.researchers.map(
                    (item, index) => (

                      <Card key={index}>

                        <h3>
                          {item.researcher_name ||
                            "Unknown Researcher"}
                        </h3>

                        <p>
                          <strong>
                            Institution:
                          </strong>{" "}
                          {item.institution || "N/A"}
                        </p>

                        <p>
                          <strong>
                            Country:
                          </strong>{" "}
                          {item.country || "N/A"}
                        </p>

                      </Card>
                    )
                  )

                )}

              </section>
            )}

          </>
        )}

      </div>

    </Layout>
  );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  count,
  onClick,
  active,
}) {

  return (

    <button
      onClick={onClick}
      style={{
        background: active
          ? "#DFFF00"
          : "#ffffff",

        color: "#111111",

        border: active
          ? "2px solid #111111"
          : "1px solid #e5e5e5",

        borderRadius: "12px",

        padding: "20px",

        textAlign: "center",

        boxShadow: active
          ? "0 6px 18px rgba(0,0,0,0.15)"
          : "0 3px 8px rgba(0,0,0,0.08)",

        cursor: "pointer",

        transition: "all 0.25s ease",

        width: "100%",
      }}

      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.transform =
            "translateY(-4px)";

          e.currentTarget.style.boxShadow =
            "0 8px 18px rgba(0,0,0,0.14)";
        }
      }}

      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.transform =
            "translateY(0)";

          e.currentTarget.style.boxShadow =
            "0 3px 8px rgba(0,0,0,0.08)";
        }
      }}
    >

      <h3>
        {title}
      </h3>

      <h1
        style={{
          color: "#2563eb",
          margin: "10px 0",
        }}
      >
        {count}
      </h1>

      <p
        style={{
          color: "#6b7280",
          margin: 0,
        }}
      >
        Results Found
      </p>

    </button>
  );
}


/* =====================================================
   SECTION TITLE
===================================================== */

function SectionTitle({ title }) {

  return (

    <h2
      style={{
        marginTop: "35px",
        marginBottom: "18px",
        color: "#1f2937",
      }}
    >
      {title}
    </h2>

  );
}


/* =====================================================
   RESULT CARD
===================================================== */

function Card({ children }) {

  return (

    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "15px",
        boxShadow:
          "0 3px 8px rgba(0,0,0,0.08)",
      }}
    >

      {children}

    </div>

  );
}


/* =====================================================
   EMPTY MESSAGE
===================================================== */

function EmptyMessage({ text }) {

  return (

    <p
      style={{
        color: "#6b7280",
        padding: "15px 0",
      }}
    >
      {text}
    </p>

  );
}


export default Search;