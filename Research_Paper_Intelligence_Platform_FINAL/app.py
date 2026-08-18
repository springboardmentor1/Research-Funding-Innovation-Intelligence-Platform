from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
import sqlite3
import os
import csv
import math
import re
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "instance", "research_intelligence.db")
DATASET = os.path.join(BASE, "datasets", "research_papers.csv")

app = Flask(__name__)
app.secret_key = os.environ.get(
    "RESEARCHIQ_SECRET_KEY",
    "researchiq-local-demo-secret"
)


def db():
    os.makedirs(os.path.dirname(DB), exist_ok=True)

    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    return conn


def init_db():
    """Create tables and synchronize the local paper corpus into SQLite."""

    conn = db()

    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            interests TEXT DEFAULT '',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            authors TEXT DEFAULT '',
            year INTEGER,
            domain TEXT DEFAULT 'Artificial Intelligence',
            venue TEXT DEFAULT '',
            abstract TEXT DEFAULT '',
            citations INTEGER DEFAULT 0,
            doi TEXT DEFAULT '',
            url TEXT DEFAULT '',
            pdf_url TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            paper_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,

            UNIQUE(user_id, paper_id),

            FOREIGN KEY(user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY(paper_id)
                REFERENCES papers(id)
                ON DELETE CASCADE
        );
    """)

    if os.path.exists(DATASET):

        with open(DATASET, encoding="utf-8", newline="") as f:

            rows = csv.DictReader(f)

            for r in rows:

                try:

                    external_id = (
                        r.get("paper_id")
                        or r.get("external_id")
                        or ""
                    ).strip()

                    title = (
                        r.get("title")
                        or "Untitled paper"
                    ).strip()

                    authors = (
                        r.get("authors")
                        or ""
                    ).strip()

                    year = int(
                        float(
                            r.get("year")
                            or 0
                        )
                    )

                    domain = (
                        r.get("domain")
                        or "Artificial Intelligence"
                    ).strip()

                    venue = (
                        r.get("venue")
                        or ""
                    ).strip()

                    abstract = (
                        r.get("abstract")
                        or ""
                    ).strip()

                    citations = int(
                        float(
                            r.get("citations")
                            or 0
                        )
                    )

                    doi = (
                        r.get("doi")
                        or ""
                    ).strip()

                    url = (
                        r.get("url")
                        or ""
                    ).strip()

                    pdf_url = (
                        r.get("pdf_url")
                        or ""
                    ).strip()

                    if not external_id:
                        continue

                    conn.execute(
                        """
                        INSERT INTO papers(
                            external_id,
                            title,
                            authors,
                            year,
                            domain,
                            venue,
                            abstract,
                            citations,
                            doi,
                            url,
                            pdf_url
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

                        ON CONFLICT(external_id)
                        DO UPDATE SET
                            title = excluded.title,
                            authors = excluded.authors,
                            year = excluded.year,
                            domain = excluded.domain,
                            venue = excluded.venue,
                            abstract = excluded.abstract,
                            citations = excluded.citations,
                            doi = excluded.doi,
                            url = excluded.url,
                            pdf_url = excluded.pdf_url
                        """,
                        (
                            external_id,
                            title,
                            authors,
                            year,
                            domain,
                            venue,
                            abstract,
                            citations,
                            doi,
                            url,
                            pdf_url,
                        ),
                    )

                except (ValueError, sqlite3.Error):
                    continue

    conn.commit()
    conn.close()


def search_papers(
    q="",
    domain="",
    start="",
    end="",
    sort="relevance",
    limit=None,
    offset=0
):

    conn = db()

    where = ["1=1"]
    params = []

    q = (q or "").strip()
    domain = (domain or "").strip()

    if q:

        term = f"%{q}%"

        where.append(
            """
            (
                title LIKE ?
                OR authors LIKE ?
                OR abstract LIKE ?
                OR domain LIKE ?
                OR venue LIKE ?
            )
            """
        )

        params.extend(
            [
                term,
                term,
                term,
                term,
                term,
            ]
        )

    if domain:

        where.append("domain = ?")
        params.append(domain)

    if start:

        try:

            where.append("year >= ?")
            params.append(int(start))

        except ValueError:
            pass

    if end:

        try:

            where.append("year <= ?")
            params.append(int(end))

        except ValueError:
            pass

    where_sql = " AND ".join(where)

    count = conn.execute(
        f"""
        SELECT COUNT(*) AS total
        FROM papers
        WHERE {where_sql}
        """,
        params,
    ).fetchone()["total"]

    if q and sort == "relevance":

        sql = f"""
            SELECT *
            FROM papers
            WHERE {where_sql}

            ORDER BY
                CASE
                    WHEN title LIKE ? THEN 5
                    ELSE 0
                END
                +
                CASE
                    WHEN abstract LIKE ? THEN 2
                    ELSE 0
                END
                +
                CASE
                    WHEN domain LIKE ? THEN 2
                    ELSE 0
                END DESC,

                citations DESC,
                year DESC
        """

        relevance_params = params + [
            f"%{q}%",
            f"%{q}%",
            f"%{q}%",
        ]

        rows = conn.execute(
            sql,
            relevance_params
        ).fetchall()

    else:

        order = {
            "year": "year DESC, citations DESC",
            "citations": "citations DESC, year DESC",
            "relevance": "citations DESC, year DESC",
        }.get(
            sort,
            "citations DESC, year DESC"
        )

        sql = f"""
            SELECT *
            FROM papers
            WHERE {where_sql}
            ORDER BY {order}
        """

        if limit is not None:

            sql += """
                LIMIT ?
                OFFSET ?
            """

            params.extend(
                [
                    limit,
                    offset
                ]
            )

        rows = conn.execute(
            sql,
            params
        ).fetchall()

    if q and sort == "relevance" and limit is not None:

        rows = rows[
            offset:
            offset + limit
        ]

    conn.close()

    return rows, count


def stats():

    conn = db()

    result = conn.execute(
        """
        SELECT
            COUNT(*) AS papers,
            COUNT(DISTINCT domain) AS domains,
            COALESCE(SUM(citations), 0) AS citations,
            COALESCE(
                ROUND(AVG(citations), 1),
                0
            ) AS avg_citations,
            MIN(year) AS min_year,
            MAX(year) AS max_year
        FROM papers
        """
    ).fetchone()

    conn.close()

    return result


def get_chart_data():

    conn = db()

    year_rows = conn.execute(
        """
        SELECT
            year,
            COUNT(*) AS count
        FROM papers
        WHERE year IS NOT NULL
        GROUP BY year
        ORDER BY year
        """
    ).fetchall()

    domain_rows = conn.execute(
        """
        SELECT
            domain,
            COUNT(*) AS count
        FROM papers
        WHERE domain IS NOT NULL
        GROUP BY domain
        ORDER BY count DESC
        """
    ).fetchall()

    conn.close()

    # Convert sqlite3.Row objects into normal JSON-safe dictionaries.
    years = [
        {
            "year": row["year"],
            "count": row["count"]
        }
        for row in year_rows
    ]

    domains = [
        {
            "domain": row["domain"],
            "count": row["count"]
        }
        for row in domain_rows
    ]

    return years, domains


@app.route("/")
def index():

    conn = db()

    s = stats()

    years, domains = get_chart_data()

    top_rows = conn.execute(
        """
        SELECT *
        FROM papers
        ORDER BY citations DESC, year DESC
        LIMIT 6
        """
    ).fetchall()

    top = [
        dict(row)
        for row in top_rows
    ]

    conn.close()

    return render_template(
        "index.html",
        stats=s,
        domains=domains,
        years=years,
        top=top
    )


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        name = request.form.get(
            "name",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        password = request.form.get(
            "password",
            ""
        )

        if len(name) < 2:

            flash(
                "Please enter your full name.",
                "danger"
            )

            return render_template(
                "register.html"
            )

        if len(email) < 5 or "@" not in email:

            flash(
                "Please enter a valid email address.",
                "danger"
            )

            return render_template(
                "register.html"
            )

        if len(password) < 6:

            flash(
                "Password must contain at least 6 characters.",
                "danger"
            )

            return render_template(
                "register.html"
            )

        try:

            conn = db()

            conn.execute(
                """
                INSERT INTO users(
                    name,
                    email,
                    password,
                    created_at
                )
                VALUES (?, ?, ?, ?)
                """,
                (
                    name,
                    email,
                    generate_password_hash(password),
                    datetime.now().isoformat()
                ),
            )

            conn.commit()
            conn.close()

            flash(
                "Account created successfully. Please sign in.",
                "success"
            )

            return redirect(
                url_for("login")
            )

        except sqlite3.IntegrityError:

            flash(
                "That email is already registered.",
                "danger"
            )

    return render_template(
        "register.html"
    )


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        password = request.form.get(
            "password",
            ""
        )

        conn = db()

        user = conn.execute(
            """
            SELECT *
            FROM users
            WHERE email = ?
            """,
            (email,)
        ).fetchone()

        if user and check_password_hash(
            user["password"],
            password
        ):

            session.clear()

            session["user_id"] = user["id"]
            session["user_name"] = user["name"]

            conn.close()

            return redirect(
                url_for("dashboard")
            )

        conn.close()

        flash(
            "Invalid email or password.",
            "danger"
        )

    return render_template(
        "login.html"
    )


@app.route("/logout")
def logout():

    session.clear()

    return redirect(
        url_for("index")
    )


@app.route("/dashboard")
def dashboard():

    s = stats()

    years, domains = get_chart_data()

    conn = db()

    top_rows = conn.execute(
        """
        SELECT *
        FROM papers
        ORDER BY citations DESC, year DESC
        LIMIT 8
        """
    ).fetchall()

    top = [
        dict(row)
        for row in top_rows
    ]

    conn.close()

    return render_template(
        "dashboard.html",
        stats=s,
        years=years,
        domains=domains,
        top=top
    )


@app.route("/papers")
def papers():

    q = request.args.get(
        "q",
        ""
    )

    domain = request.args.get(
        "domain",
        ""
    )

    start = request.args.get(
        "start",
        ""
    )

    end = request.args.get(
        "end",
        ""
    )

    sort = request.args.get(
        "sort",
        "relevance"
    )

    try:

        page = max(
            int(
                request.args.get(
                    "page",
                    1
                )
            ),
            1
        )

    except ValueError:

        page = 1

    per_page = 20

    rows, total = search_papers(
        q,
        domain,
        start,
        end,
        sort,
        limit=per_page,
        offset=(page - 1) * per_page
    )

    conn = db()

    domains = [
        r["domain"]
        for r in conn.execute(
            """
            SELECT DISTINCT domain
            FROM papers
            WHERE domain IS NOT NULL
            ORDER BY domain
            """
        ).fetchall()
    ]

    conn.close()

    pages = max(
        math.ceil(
            total / per_page
        ),
        1
    )

    return render_template(
        "papers.html",
        papers=rows,
        domains=domains,
        q=q,
        domain=domain,
        start=start,
        end=end,
        sort=sort,
        page=page,
        pages=pages,
        total=total,
    )


@app.route("/paper/<int:paper_id>")
def paper(paper_id):

    conn = db()

    p = conn.execute(
        """
        SELECT *
        FROM papers
        WHERE id = ?
        """,
        (paper_id,)
    ).fetchone()

    conn.close()

    if not p:
        return render_template("404.html"), 404

    # Convert sqlite Row to a normal dictionary.
    # This keeps the template/API data safe and predictable.
    paper_data = dict(p)

    # Clean DOI if the CSV contains a full DOI URL.
    doi = paper_data.get("doi", "") or ""
    doi = doi.strip()

    if doi.startswith("https://doi.org/"):
        doi = doi.replace("https://doi.org/", "", 1)
    elif doi.startswith("http://doi.org/"):
        doi = doi.replace("http://doi.org/", "", 1)

    paper_data["doi"] = doi

    return render_template(
        "paper.html",
        p=paper_data
    )


@app.route("/bookmarks", methods=["GET", "POST"])
def bookmarks():

    if "user_id" not in session:

        return redirect(
            url_for("login")
        )

    conn = db()

    if request.method == "POST":

        try:

            paper_id = int(
                request.form.get(
                    "paper_id",
                    "0"
                )
            )

            conn.execute(
                """
                INSERT OR IGNORE INTO bookmarks(
                    user_id,
                    paper_id,
                    created_at
                )
                VALUES (?, ?, ?)
                """,
                (
                    session["user_id"],
                    paper_id,
                    datetime.now().isoformat()
                ),
            )

            conn.commit()

            flash(
                "Paper saved to your library.",
                "success"
            )

        except ValueError:

            flash(
                "Invalid paper selection.",
                "danger"
            )

    rows = conn.execute(
        """
        SELECT p.*
        FROM papers p
        JOIN bookmarks b
            ON b.paper_id = p.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        """,
        (session["user_id"],)
    ).fetchall()

    conn.close()

    return render_template(
        "bookmarks.html",
        papers=rows
    )


@app.route(
    "/bookmarks/remove/<int:paper_id>",
    methods=["POST"]
)
def remove_bookmark(paper_id):

    if "user_id" not in session:

        return redirect(
            url_for("login")
        )

    conn = db()

    conn.execute(
        """
        DELETE FROM bookmarks
        WHERE user_id = ?
        AND paper_id = ?
        """,
        (
            session["user_id"],
            paper_id
        )
    )

    conn.commit()
    conn.close()

    flash(
        "Paper removed from your library.",
        "success"
    )

    return redirect(
        url_for("bookmarks")
    )


@app.route("/api/search")
def api_search():

    rows, total = search_papers(
        request.args.get("q", ""),
        request.args.get("domain", ""),
        request.args.get("start", ""),
        request.args.get("end", ""),
        request.args.get("sort", "relevance"),
        limit=100,
        offset=0,
    )

    return jsonify(
        {
            "total": total,
            "results": [
                dict(row)
                for row in rows
            ]
        }
    )


@app.route("/api/recommend/<int:paper_id>")
def recommend(paper_id):

    conn = db()

    base = conn.execute(
        """
        SELECT *
        FROM papers
        WHERE id = ?
        """,
        (paper_id,)
    ).fetchone()

    rows = conn.execute(
        """
        SELECT *
        FROM papers
        WHERE id != ?
        """,
        (paper_id,)
    ).fetchall()

    conn.close()

    if not base:

        return jsonify([])

    tokens = set(
        re.findall(
            r"[a-zA-Z]{4,}",
            (
                (base["title"] or "")
                + " "
                + (base["abstract"] or "")
            ).lower()
        )
    )

    scored = []

    for row in rows:

        text = (
            (row["title"] or "")
            + " "
            + (row["abstract"] or "")
        ).lower()

        rtokens = set(
            re.findall(
                r"[a-zA-Z]{4,}",
                text
            )
        )

        overlap = len(
            tokens & rtokens
        )

        domain_bonus = (
            5
            if row["domain"] == base["domain"]
            else 0
        )

        year_bonus = (
            1
            if (row["year"] or 0) >= 2024
            else 0
        )

        citation_signal = (
            math.log1p(
                max(
                    row["citations"] or 0,
                    0
                )
            )
            * 0.15
        )

        score = (
            overlap
            + domain_bonus
            + year_bonus
            + citation_signal
        )

        scored.append(
            (
                score,
                row
            )
        )

    scored.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return jsonify(
        [
            dict(row)
            for _, row in scored[:6]
        ]
    )


@app.route("/health")
def health():

    s = stats()

    return jsonify(
        {
            "status": "ok",
            "papers": s["papers"],
            "domains": s["domains"]
        }
    )


# Initialize database
init_db()


if __name__ == "__main__":
    app.run(
        debug=True
    )