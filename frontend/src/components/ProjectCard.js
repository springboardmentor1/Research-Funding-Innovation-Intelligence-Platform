function ProjectCard({
    title,
    acronym,
    domain,
    programme,
    startDate,
    endDate,
    teaser,
    url
}) {
    return (
        <div className="card">

            <h3>{title || "Untitled Project"}</h3>

            <p>
                <strong>Project Acronym:</strong>{" "}
                {acronym || "Not available"}
            </p>

            <p>
                <strong>Research Field:</strong>{" "}
                {domain || "Not available"}
            </p>

            <p>
                <strong>Programme:</strong>{" "}
                {programme || "Not available"}
            </p>

            <p>
                <strong>Start Date:</strong>{" "}
                {startDate || "Not available"}
            </p>

            <p>
                <strong>End Date:</strong>{" "}
                {endDate || "Not available"}
            </p>

            {teaser && (
                <p className="project-description">
                    <strong>Description:</strong>{" "}
                    {teaser.length > 220
                        ? teaser.substring(0, 220) + "..."
                        : teaser}
                </p>
            )}

            {url && (
                <button
                    className="details-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(url, "_blank");
                    }}
                >
                    View Details →
                </button>
            )}

        </div>
    );
}

export default ProjectCard;