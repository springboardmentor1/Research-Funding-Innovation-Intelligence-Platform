import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getPublicationDetails } from "../api/publicationApi";

import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiStar,
  FiExternalLink,
  FiUsers,
  FiHash
} from "react-icons/fi";

function PublicationDetails() {
  const { doi } = useParams();
  const navigate = useNavigate();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PUBLICATION DETAILS
  // =====================================================

  useEffect(() => {
    async function loadPublication() {
      setLoading(true);
      setError("");

      try {
        const data = await getPublicationDetails(doi);

        console.log(
          "Publication details API response:",
          data
        );

        /*
         * Some APIs return:
         * { data: {...} }
         *
         * while others return:
         * {...}
         *
         * Support both formats.
         */

        setPublication(data.data || data);
      } catch (err) {
        console.error(
          "Publication details error:",
          err
        );

        setError(
          "Failed to load publication details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (doi) {
      loadPublication();
    }
  }, [doi]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <Layout>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
            fontWeight: "600",
            color: "#374151"
          }}
        >
          Loading Publication...
        </div>
      </Layout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <Layout>
        <div
          style={{
            maxWidth: "900px",
            margin: "50px auto",
            padding: "40px",
            textAlign: "center",
            background: "#fff",
            borderRadius: "14px",
            boxShadow:
              "0 6px 20px rgba(0,0,0,.08)"
          }}
        >
          <h2
            style={{
              color: "#dc2626",
              marginBottom: "20px"
            }}
          >
            {error}
          </h2>

          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              border: "none",
              background: "#111",
              color: "#fff",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            <FiArrowLeft />
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  // =====================================================
  // PUBLICATION NOT FOUND
  // =====================================================

  if (!publication) {
    return (
      <Layout>
        <div
          style={{
            maxWidth: "900px",
            margin: "50px auto",
            padding: "40px",
            textAlign: "center",
            background: "#fff",
            borderRadius: "14px",
            boxShadow:
              "0 6px 20px rgba(0,0,0,.08)"
          }}
        >
          <h2>
            Publication not found.
          </h2>

          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            <FiArrowLeft />
            Back to Publications
          </button>
        </div>
      </Layout>
    );
  }

  // =====================================================
  // DOI
  // =====================================================

  const hasDoi =
    publication.doi &&
    publication.doi !== "Not Available" &&
    publication.doi.trim() !== "";

  const doiUrl = hasDoi
    ? publication.doi.startsWith("http")
      ? publication.doi
      : `https://doi.org/${publication.doi}`
    : "";

  // =====================================================
  // AUTHORS
  // =====================================================

  const authors =
    publication.authors ||
    publication.author ||
    "Not available";

  // =====================================================
  // CITATIONS
  // =====================================================

  const citations = Number(
    publication.cited_by_count || 0
  ).toLocaleString();

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px"
        }}
      >

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            padding: "10px 18px",
            border: "none",
            background: "#111111",
            color: "#ffffff",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          <FiArrowLeft />

          Back to Publications
        </button>


        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 8px 25px rgba(0,0,0,.08)"
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "18px",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            <FiBookOpen />

            Research Publication
          </div>


          {/* =================================================
              TITLE
          ================================================= */}

          <h1
            style={{
              fontSize: "32px",
              lineHeight: "1.35",
              margin: "0 0 25px",
              color: "#111827"
            }}
          >
            {publication.title ||
              "Untitled Publication"}
          </h1>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <hr
            style={{
              border: "none",
              borderTop:
                "1px solid #e5e7eb",
              marginBottom: "25px"
            }}
          />


          {/* =================================================
              PUBLICATION INFORMATION
          ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
              marginBottom: "30px"
            }}
          >

            {/* YEAR */}

            <div
              style={{
                padding: "18px",
                background: "#f9fafb",
                borderRadius: "12px",
                border:
                  "1px solid #e5e7eb"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#6b7280",
                  fontSize: "13px",
                  marginBottom: "8px"
                }}
              >
                <FiCalendar />

                Publication Year
              </div>

              <strong
                style={{
                  fontSize: "18px",
                  color: "#111827"
                }}
              >
                {publication.publication_year ||
                  "Not available"}
              </strong>
            </div>


            {/* TYPE */}

            <div
              style={{
                padding: "18px",
                background: "#f9fafb",
                borderRadius: "12px",
                border:
                  "1px solid #e5e7eb"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#6b7280",
                  fontSize: "13px",
                  marginBottom: "8px"
                }}
              >
                <FiFileText />

                Publication Type
              </div>

              <strong
                style={{
                  fontSize: "18px",
                  color: "#111827"
                }}
              >
                {publication.type ||
                  "Not available"}
              </strong>
            </div>


            {/* CITATIONS */}

            <div
              style={{
                padding: "18px",
                background: "#f9fafb",
                borderRadius: "12px",
                border:
                  "1px solid #e5e7eb"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#6b7280",
                  fontSize: "13px",
                  marginBottom: "8px"
                }}
              >
                <FiStar />

                Citations
              </div>

              <strong
                style={{
                  fontSize: "18px",
                  color: "#111827"
                }}
              >
                {citations}
              </strong>
            </div>

          </div>


          {/* =================================================
              AUTHORS
          ================================================= */}

          <div
            style={{
              marginBottom: "25px"
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                color: "#111827"
              }}
            >
              <FiUsers />

              Authors
            </h3>

            <div
              style={{
                padding: "16px",
                background: "#f9fafb",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "10px",
                color: "#374151",
                lineHeight: "1.6"
              }}
            >
              {authors}
            </div>
          </div>


          {/* =================================================
              DOI
          ================================================= */}

          <div
            style={{
              marginBottom: "30px"
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                color: "#111827"
              }}
            >
              <FiHash />

              DOI
            </h3>

            <div
              style={{
                padding: "16px",
                background: "#f9fafb",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "10px",
                wordBreak: "break-all"
              }}
            >
              {hasDoi ? (
                <a
                  href={doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: "600"
                  }}
                >
                  {publication.doi}
                </a>
              ) : (
                <span
                  style={{
                    color: "#9ca3af"
                  }}
                >
                  DOI not available
                </span>
              )}
            </div>
          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >

            {/* OPEN DOI */}

            {hasDoi && (
              <a
                href={doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  background: "#111111",
                  color: "#ffffff",
                  borderRadius: "9px",
                  textDecoration: "none",
                  fontWeight: "600"
                }}
              >
                <FiExternalLink />

                Open DOI
              </a>
            )}


            {/* BACK */}

            <button
              onClick={() => navigate(-1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "#f3f4f6",
                color: "#111827",
                border:
                  "1px solid #d1d5db",
                borderRadius: "9px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              <FiArrowLeft />

              Back to Publications
            </button>

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default PublicationDetails;