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

            <h3>{title}</h3>

            <p>
                <strong>Project Acronym:</strong> {acronym}
            </p>

            <p>
                <strong>Research Field:</strong> {domain}
            </p>

            <p>
                <strong>Programme:</strong> {programme}
            </p>

            <p>
                <strong>Start Date:</strong> {startDate}
            </p>

            <p>
                <strong>End Date:</strong> {endDate}
            </p>

            {teaser && (
                <p>
                    <strong>Description:</strong> {teaser}
                </p>
            )}

            <button
                onClick={() => window.open(url, "_blank")}
            >
                View Details
            </button>

        </div>
    );
}

export default ProjectCard;