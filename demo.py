import pandas as pd
import streamlit as st
import requests

from auth import init_db, create_user, authenticate_user
from funding_data import funding_opportunities


# =========================================================
# PAGE CONFIGURATION
# =========================================================

st.set_page_config(
    page_title="AI Research Intelligence Platform",
    page_icon="🤖",
    layout="wide"
)

BASE_URL = "http://127.0.0.1:8000"


# =========================================================
# CUSTOM CSS
# =========================================================

st.markdown(
    """
    <style>

    /* =====================================================
       GLOBAL
       ===================================================== */

    .stApp {
        background-color: #000000;
        color: #ffffff;
    }

    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
        max-width: 1200px;
    }

    /* =====================================================
       LANDING PAGE
       ===================================================== */

    .landing-container {
        text-align: center;
        padding-top: 25px;
        padding-bottom: 20px;
    }

    .landing-badge {
        display: inline-block;
        padding: 8px 18px;
        border: 1px solid #333333;
        border-radius: 30px;
        background-color: #111111;
        color: #bbbbbb;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1px;
        margin-bottom: 20px;
    }

    .landing-title {
        font-size: 58px;
        font-weight: 800;
        line-height: 1.1;
        color: #ffffff;
        margin-bottom: 20px;
    }

    .landing-title span {
        color: #8b5cf6;
    }

    .landing-subtitle {
        max-width: 760px;
        margin: auto;
        color: #a1a1aa;
        font-size: 18px;
        line-height: 1.7;
        margin-bottom: 25px;
    }

    .landing-small-text {
        color: #666666;
        font-size: 13px;
        margin-bottom: 25px;
    }

    /* =====================================================
       LANDING FEATURE CARDS
       ===================================================== */

    .feature-card {
        background-color: #0d0d0d;
        border: 1px solid #242424;
        border-radius: 16px;
        padding: 22px;
        min-height: 170px;
        margin-bottom: 15px;
    }

    .feature-icon {
        font-size: 28px;
        margin-bottom: 10px;
    }

    .feature-title {
        color: #ffffff;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .feature-description {
        color: #888888;
        font-size: 14px;
        line-height: 1.6;
    }

    .landing-section-title {
        color: #ffffff;
        font-size: 27px;
        font-weight: 700;
        text-align: center;
        margin-top: 30px;
        margin-bottom: 25px;
    }

    .landing-footer {
        text-align: center;
        color: #555555;
        font-size: 13px;
        padding-top: 35px;
        padding-bottom: 10px;
    }

    /* =====================================================
       BUTTONS
       ===================================================== */

    .stButton > button {
        border-radius: 10px;
        font-weight: 600;
    }

    /* =====================================================
       APPLICATION HERO
       ===================================================== */

    .hero {
        background: linear-gradient(
            135deg,
            #111111,
            #18181b
        );
        border: 1px solid #292929;
        border-radius: 18px;
        padding: 30px;
        margin-bottom: 25px;
    }

    .hero h1 {
        color: #ffffff;
        font-size: 38px;
        margin-bottom: 10px;
    }

    .hero p {
        color: #a1a1aa;
        font-size: 16px;
        line-height: 1.6;
    }

    /* =====================================================
       SECTION TITLES
       ===================================================== */

    .section-title {
        font-size: 27px;
        font-weight: 700;
        color: #ffffff;
        margin-top: 25px;
        margin-bottom: 12px;
    }

    /* =====================================================
       SIDEBAR
       ===================================================== */

    [data-testid="stSidebar"] {
        background-color: #0b0b0b;
        border-right: 1px solid #222222;
    }

    [data-testid="stSidebar"] * {
        color: #ffffff;
    }

    /* =====================================================
       METRICS
       ===================================================== */

    [data-testid="stMetric"] {
        background-color: #111111;
        border: 1px solid #292929;
        padding: 15px;
        border-radius: 12px;
    }

    /* =====================================================
       INPUTS
       ===================================================== */

    input,
    textarea {
        background-color: #111111 !important;
        color: #ffffff !important;
    }
    

    </style>
    """,
    unsafe_allow_html=True
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

try:
    init_db()
except Exception:
    pass


# =========================================================
# SESSION STATE
# =========================================================

if "logged_in" not in st.session_state:
    st.session_state.logged_in = False

if "user" not in st.session_state:
    st.session_state.user = None

if "page" not in st.session_state:
    st.session_state.page = "landing"

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []


# =========================================================
# API HELPER
# =========================================================

def get_json(endpoint, timeout=30, params=None):

    try:
        response = requests.get(
            f"{BASE_URL}{endpoint}",
            params=params,
            timeout=timeout
        )

        if response.status_code == 200:
            return response.json()

    except requests.RequestException:
        pass

    return None


# =========================================================
# TOTAL RESEARCH
# =========================================================

def extract_total_research(data):

    if not isinstance(data, dict):
        return 0

    values = [
        data.get("total_research_works"),
        data.get("research_works"),
        data.get("total"),
        data.get("count")
    ]

    meta = data.get("meta")

    if isinstance(meta, dict):
        values.append(meta.get("count"))

    for value in values:

        try:
            value = int(value)

            if value > 0:
                return value

        except (TypeError, ValueError):
            continue

    return 0


def get_total_research():

    data = get_json(
        "/api/research/stats",
        timeout=20
    )

    total = extract_total_research(data)

    if total > 0:
        return total

    try:

        response = requests.get(
            "https://api.openalex.org/works",
            params={
                "search": "artificial intelligence",
                "per-page": 1
            },
            headers={
                "User-Agent": "AI-Research-Intelligence-Platform"
            },
            timeout=30
        )

        if response.status_code == 200:

            data = response.json()
            meta = data.get("meta", {})

            if isinstance(meta, dict):

                count = int(meta.get("count", 0))

                if count > 0:
                    return count

    except Exception:
        pass

    return 3157909


# =========================================================
# RESEARCH TREND DATA
# =========================================================

def extract_trend_dataframe(data):

    empty_df = pd.DataFrame(
        columns=["Year", "Research Works"]
    )

    if not isinstance(data, dict):
        return empty_df

    rows = []

    groups = data.get("group_by", [])

    if isinstance(groups, list):

        for item in groups:

            if not isinstance(item, dict):
                continue

            try:

                year = int(
                    str(item.get("key", "")).strip()
                )

                count = int(
                    item.get("count", 0)
                )

                if 1900 <= year <= 2100:

                    rows.append({
                        "Year": year,
                        "Research Works": count
                    })

            except (ValueError, TypeError):
                continue

    if not rows:

        trends = data.get(
            "research_trends",
            {}
        )

        if isinstance(trends, dict):

            for year, count in trends.items():

                try:

                    year = int(year)
                    count = int(count)

                    if 1900 <= year <= 2100:

                        rows.append({
                            "Year": year,
                            "Research Works": count
                        })

                except (ValueError, TypeError):
                    continue

    if not rows:
        return empty_df

    return (
        pd.DataFrame(rows)
        .drop_duplicates(subset=["Year"])
        .sort_values("Year")
        .reset_index(drop=True)
    )


def get_research_trends():

    data = get_json(
        "/api/research/trends",
        timeout=30
    )

    df = extract_trend_dataframe(data)

    if not df.empty:
        return df

    try:

        response = requests.get(
            "https://api.openalex.org/works",
            params={
                "search": "artificial intelligence",
                "group_by": "publication_year",
                "per-page": 200
            },
            headers={
                "User-Agent":
                "AI-Research-Intelligence-Platform"
            },
            timeout=60
        )

        if response.status_code == 200:

            df = extract_trend_dataframe(
                response.json()
            )

            if not df.empty:
                return df

    except Exception:
        pass

    fallback = {
        2015: 32855,
        2016: 38472,
        2017: 47940,
        2018: 70443,
        2019: 98522,
        2020: 141629,
        2021: 190565,
        2022: 238682,
        2023: 355096,
        2024: 457312,
        2025: 646578
    }

    return pd.DataFrame([
        {
            "Year": year,
            "Research Works": count
        }
        for year, count in fallback.items()
    ])


# =========================================================
# LANDING PAGE
# =========================================================

def landing_page():

    st.markdown(
        "<div class='landing-container'>",
        unsafe_allow_html=True
    )

    # Badge
    st.markdown(
        "<div class='landing-badge'>"
        "🤖 AI-POWERED RESEARCH INTELLIGENCE"
        "</div>",
        unsafe_allow_html=True
    )

    # Main title
    st.markdown(
        "<div class='landing-title'>"
        "Discover. <span>Fund.</span> Innovate."
        "</div>",
        unsafe_allow_html=True
    )

    # Description
    st.markdown(
        "<div class='landing-subtitle'>"
        "A centralized intelligence platform for "
        "discovering research, exploring funding "
        "opportunities, analyzing trends and evaluating "
        "innovative ideas."
        "</div>",
        unsafe_allow_html=True
    )

    st.markdown(
        "<div class='landing-small-text'>"
        "Research intelligence powered by OpenAlex"
        "</div>",
        unsafe_allow_html=True
    )

    st.markdown("</div>", unsafe_allow_html=True)

    # =====================================================
    # GET STARTED
    # =====================================================

    left, center, right = st.columns(
        [1, 2, 1]
    )

    with center:

        if st.button(
            "🚀 Get Started",
            type="primary",
            use_container_width=True,
            key="landing_get_started"
        ):

            st.session_state.page = "authentication"
            st.rerun()

    st.write("")

    # =====================================================
    # FEATURES
    # =====================================================

    st.markdown(
        "<div class='landing-section-title'>"
        "Everything You Need for Smarter Research"
        "</div>",
        unsafe_allow_html=True
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon">📚</div>
                <div class="feature-title">
                    Research Intelligence
                </div>
                <div class="feature-description">
                    Discover research publications, recent
                    studies and publication trends using
                    OpenAlex research data.
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col2:

        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon">💰</div>
                <div class="feature-title">
                    Funding Opportunities
                </div>
                <div class="feature-description">
                    Explore research funding opportunities,
                    organizations, research areas, deadlines
                    and funding information.
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col3:

        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon">💡</div>
                <div class="feature-title">
                    Innovation Intelligence
                </div>
                <div class="feature-description">
                    Evaluate research ideas using novelty,
                    impact, feasibility and scalability
                    indicators.
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon">📜</div>
                <div class="feature-title">
                    Patent Intelligence
                </div>
                <div class="feature-description">
                    Explore existing patents and technologies
                    related to your research topic.
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col2:

        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon">🔥</div>
                <div class="feature-title">
                    Trending Funding
                </div>
                <div class="feature-description">
                    Identify research areas with strong
                    funding activity and discover where
                    opportunities are concentrated.
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col3:

        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon">🤖</div>
                <div class="feature-title">
                    AI Research Assistant
                </div>
                <div class="feature-description">
                    Get quick guidance on research topics,
                    funding, machine learning and innovation.
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    # =====================================================
    # PLATFORM FLOW
    # =====================================================

    st.markdown(
        "<div class='landing-section-title'>"
        "🚀 Your Research Journey"
        "</div>",
        unsafe_allow_html=True
    )

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown("### 🔍 Discover")
        st.caption(
            "Find relevant research and publications."
        )

    with col2:
        st.markdown("### 💰 Fund")
        st.caption(
            "Explore funding opportunities."
        )

    with col3:
        st.markdown("### 📊 Analyze")
        st.caption(
            "Understand research and funding trends."
        )

    with col4:
        st.markdown("### 💡 Innovate")
        st.caption(
            "Evaluate and improve your research ideas."
        )

    # =====================================================
    # DATA SOURCE
    # =====================================================

    st.markdown(
        "<div class='landing-section-title'>"
        "🌐 Research Intelligence"
        "</div>",
        unsafe_allow_html=True
    )

    st.info(
        "The platform uses OpenAlex research data to "
        "provide publication information, recent research "
        "activity and research trend analysis."
    )

    # =====================================================
    # FOOTER
    # =====================================================

    st.markdown(
        """
        <div class="landing-footer">
            AI Research Intelligence Platform<br>
            Discover research. Find opportunities.
            Accelerate innovation.
        </div>
        """,
        unsafe_allow_html=True
    )


# =========================================================
# AUTHENTICATION PAGE
# =========================================================

def authentication_page():

    if st.button(
        "← Back to Landing Page",
        key="back_to_landing"
    ):

        st.session_state.page = "landing"
        st.rerun()

    st.write("")

    st.title("Discover. Fund. Innovate. 🚀")

    st.write(
        "Explore research, funding opportunities, "
        "emerging trends and innovation insights "
        "from one intelligent platform."
    )

    st.write("")

    login_tab, signup_tab = st.tabs(
        ["🔐 Login", "📝 Create Account"]
    )

    # =====================================================
    # LOGIN
    # =====================================================

    with login_tab:

        st.subheader("Welcome Back")

        email = st.text_input(
            "Email",
            key="login_email"
        )

        password = st.text_input(
            "Password",
            type="password",
            key="login_password"
        )

        if st.button(
            "Login",
            type="primary",
            use_container_width=True,
            key="login_button"
        ):

            if not email or not password:

                st.warning(
                    "Please enter your email and password."
                )

            else:

                user = authenticate_user(
                    email,
                    password
                )

                if user:

                    st.session_state.logged_in = True
                    st.session_state.user = user
                    st.session_state.page = "home"

                    st.success(
                        "Login successful!"
                    )

                    st.rerun()

                else:

                    st.error(
                        "Invalid email or password."
                    )

    # =====================================================
    # SIGNUP
    # =====================================================

    with signup_tab:

        st.subheader("Create Your Account")

        name = st.text_input(
            "Full Name",
            key="signup_name"
        )

        email = st.text_input(
            "Email",
            key="signup_email"
        )

        password = st.text_input(
            "Password",
            type="password",
            key="signup_password"
        )

        confirm_password = st.text_input(
            "Confirm Password",
            type="password",
            key="signup_confirm_password"
        )

        research_interest = st.text_input(
            "Research Interest",
            placeholder="Example: Computer Vision",
            key="research_interest"
        )

        if st.button(
            "Create Account",
            type="primary",
            use_container_width=True,
            key="create_account_button"
        ):

            if not name or not email or not password:

                st.warning(
                    "Please fill in all required fields."
                )

            elif password != confirm_password:

                st.error(
                    "Passwords do not match."
                )

            elif len(password) < 6:

                st.error(
                    "Password must contain at least 6 characters."
                )

            else:

                success, message = create_user(
                    name,
                    email,
                    password,
                    research_interest
                )

                if success:

                    st.success(message)

                    st.info(
                        "You can now login using your account."
                    )

                else:

                    st.error(message)


# =========================================================
# SIDEBAR NAVIGATION
# =========================================================

def navigation_sidebar():

    user = st.session_state.user

    with st.sidebar:

        st.title("🤖 Research AI")

        if user:
            st.write(
                f"Welcome, **{user['name']}**"
            )

        st.divider()

        st.subheader("Navigation")

        if st.button(
            "🏠 Home",
            use_container_width=True,
            key="nav_home"
        ):

            st.session_state.page = "home"
            st.rerun()

        if st.button(
            "📚 Research Intelligence",
            use_container_width=True,
            key="nav_research"
        ):

            st.session_state.page = "research"
            st.rerun()

        if st.button(
            "💰 Funding Opportunities",
            use_container_width=True,
            key="nav_funding"
        ):

            st.session_state.page = "funding"
            st.rerun()

        if st.button(
            "📜 Patents",
            use_container_width=True,
            key="nav_patents"
        ):

            st.session_state.page = "patents"
            st.rerun()

        if st.button(
            "💡 Innovation Score",
            use_container_width=True,
            key="nav_innovation"
        ):

            st.session_state.page = "innovation"
            st.rerun()

        if st.button(
            "🔥 Trending Funding",
            use_container_width=True,
            key="nav_trending"
        ):

            st.session_state.page = "trending"
            st.rerun()

        if st.button(
            "🤖 AI Research Assistant",
            use_container_width=True,
            key="nav_assistant"
        ):

            st.session_state.page = "assistant"
            st.rerun()

        if st.button(
            "👤 My Profile",
            use_container_width=True,
            key="nav_profile"
        ):

            st.session_state.page = "profile"
            st.rerun()

        st.divider()

        if st.button(
            "🚪 Logout",
            use_container_width=True,
            key="nav_logout"
        ):

            st.session_state.logged_in = False
            st.session_state.user = None
            st.session_state.page = "landing"
            st.session_state.chat_history = []

            st.rerun()


# =========================================================
# RESEARCH SEARCH
# =========================================================

def search_research(topic):

    topic = topic.strip()

    if not topic:

        st.warning(
            "Please enter a research topic."
        )

        return

    try:

        response = requests.get(
            f"{BASE_URL}/api/research/search",
            params={
                "topic": topic
            },
            timeout=30
        )

        if response.status_code != 200:

            st.error(
                f"Research search failed. "
                f"Backend status: {response.status_code}"
            )

            return

        data = response.json()

        results = data.get(
            "results",
            []
        )

        st.subheader(
            f"🔎 Research Results: "
            f"{data.get('topic', topic)}"
        )

        if not results:

            st.info(
                "No research papers found for this topic."
            )

            return

        st.success(
            f"Found {len(results)} research papers."
        )

        for index, research in enumerate(
            results,
            start=1
        ):

            title = research.get(
                "title",
                "Untitled Research Paper"
            )

            year = research.get(
                "publication_year",
                "Unknown"
            )

            doi = research.get("doi")

            with st.container(border=True):

                st.markdown(
                    f"### {index}. {title}"
                )

                st.write(
                    f"📅 **Publication Year:** {year}"
                )

                if doi:

                    st.markdown(
                        f"🔗 **DOI:** "
                        f"[Open Research Paper]({doi})"
                    )

                else:

                    st.write(
                        "🔗 DOI: Not available"
                    )

    except requests.exceptions.Timeout:

        st.error(
            "Research search timed out. "
            "Please try again."
        )

    except requests.exceptions.ConnectionError:

        st.error(
            "Could not connect to the research backend. "
            "Make sure FastAPI is running."
        )

    except Exception as e:

        st.error(
            f"Research search error: {e}"
        )


# =========================================================
# FUNDING OPPORTUNITIES
# =========================================================

def funding_page():

    st.markdown(
        '<div class="section-title">'
        '💰 Funding Opportunities'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "Explore research funding opportunities "
        "from organizations and institutions."
    )

    st.divider()

    search = st.text_input(
        "🔍 Search Funding Opportunities",
        placeholder="Example: Artificial Intelligence",
        key="funding_search"
    )

    areas = ["All"]

    for opportunity in funding_opportunities:

        area = opportunity.get(
            "research_area",
            "Other"
        )

        if area not in areas:
            areas.append(area)

    selected_area = st.selectbox(
        "Research Area",
        areas,
        key="funding_area"
    )

    st.divider()

    filtered_opportunities = []

    for opportunity in funding_opportunities:

        search_text = search.lower().strip()

        matches_search = (
            not search_text
            or search_text in opportunity.get(
                "opportunity",
                ""
            ).lower()
            or search_text in opportunity.get(
                "organization",
                ""
            ).lower()
            or search_text in opportunity.get(
                "research_area",
                ""
            ).lower()
        )

        matches_area = (
            selected_area == "All"
            or opportunity.get(
                "research_area"
            ) == selected_area
        )

        if matches_search and matches_area:
            filtered_opportunities.append(
                opportunity
            )

    if not filtered_opportunities:

        st.warning(
            "No funding opportunities found."
        )

        return

    st.subheader(
        f"🎯 {len(filtered_opportunities)} "
        f"Funding Opportunities Found"
    )

    for opportunity in filtered_opportunities:

        with st.container(border=True):

            st.markdown(
                f"### 💰 "
                f"{opportunity.get('opportunity', 'Funding Opportunity')}"
            )

            st.write(
                f"**Organization:** "
                f"{opportunity.get('organization', 'N/A')}"
            )

            col1, col2, col3 = st.columns(3)

            with col1:
                st.write(
                    f"**Research Area:** "
                    f"{opportunity.get('research_area', 'N/A')}"
                )

            with col2:
                st.write(
                    f"**Funding Amount:** "
                    f"{opportunity.get('funding_amount', 'N/A')}"
                )

            with col3:
                st.write(
                    f"**Deadline:** "
                    f"{opportunity.get('deadline', 'N/A')}"
                )

            st.write(
                f"**Eligibility:** "
                f"{opportunity.get('eligibility', 'N/A')}"
            )

            st.write(
                opportunity.get(
                    "description",
                    "No description available."
                )
            )

            link = opportunity.get("link")

            if link:
                st.link_button(
                    "🔗 View Funding Organization",
                    link
                )


# =========================================================
# TRENDING FUNDING
# =========================================================

def trending_funding_page():

    st.markdown(
        '<div class="section-title">'
        '🔥 Trending Funding'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "Explore research areas with the highest "
        "number of funding opportunities."
    )

    st.divider()

    funding_counts = {}

    for opportunity in funding_opportunities:

        area = opportunity.get(
            "research_area",
            "Other"
        )

        funding_counts[area] = (
            funding_counts.get(area, 0) + 1
        )

    sorted_funding = sorted(
        funding_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.metric(
            "🔥 Research Areas",
            len(funding_counts)
        )

    with col2:

        st.metric(
            "💰 Total Opportunities",
            len(funding_opportunities)
        )

    with col3:

        if sorted_funding:

            st.metric(
                "🏆 Top Research Area",
                sorted_funding[0][0]
            )

    st.divider()

    st.subheader(
        "📈 Funding Trends"
    )

    if sorted_funding:

        max_count = max(
            funding_counts.values()
        )

        for rank, (area, count) in enumerate(
            sorted_funding,
            start=1
        ):

            col1, col2, col3 = st.columns(
                [1, 5, 2]
            )

            with col1:
                st.write(f"**#{rank}**")

            with col2:
                st.write(f"**{area}**")

            with col3:
                st.write(
                    f"**{count} opportunities**"
                )

            st.progress(
                count / max_count
            )

    st.divider()

    st.subheader(
        "📊 Funding Distribution"
    )

    chart_data = pd.DataFrame({
        "Research Area": [
            item[0]
            for item in sorted_funding
        ],
        "Opportunities": [
            item[1]
            for item in sorted_funding
        ]
    })

    if not chart_data.empty:

        st.bar_chart(
            chart_data.set_index(
                "Research Area"
            )
        )

    if sorted_funding:

        top_area = sorted_funding[0][0]

        st.info(
            f"💡 **Insight:** {top_area} currently "
            f"has the highest number of funding "
            f"opportunities in the platform."
        )


# =========================================================
# INNOVATION SCORE
# =========================================================

def innovation_score_page():

    st.markdown(
        '<div class="section-title">'
        '💡 Innovation Score'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "Evaluate the potential of a research idea "
        "using novelty, impact, feasibility and scalability."
    )

    st.divider()

    research_idea = st.text_area(
        "🧠 Enter your research idea",
        placeholder=(
            "Example: AI-powered system for detecting "
            "road damage using computer vision..."
        ),
        height=120,
        key="innovation_idea"
    )

    research_area = st.selectbox(
        "Research Area",
        [
            "Artificial Intelligence",
            "Machine Learning",
            "Computer Vision",
            "Natural Language Processing",
            "Robotics",
            "Healthcare AI",
            "Agriculture AI",
            "Other"
        ],
        key="innovation_area"
    )

    st.subheader(
        "📊 Evaluate Your Research Idea"
    )

    col1, col2 = st.columns(2)

    with col1:

        novelty = st.slider(
            "🆕 Novelty",
            1,
            10,
            7,
            key="innovation_novelty"
        )

        impact = st.slider(
            "🌍 Potential Impact",
            1,
            10,
            7,
            key="innovation_impact"
        )

    with col2:

        feasibility = st.slider(
            "⚙️ Technical Feasibility",
            1,
            10,
            7,
            key="innovation_feasibility"
        )

        scalability = st.slider(
            "📈 Scalability",
            1,
            10,
            7,
            key="innovation_scalability"
        )

    st.divider()

    if st.button(
        "💡 Calculate Innovation Score",
        type="primary",
        use_container_width=True,
        key="calculate_innovation"
    ):

        if not research_idea.strip():

            st.warning(
                "Please enter a research idea first."
            )

        else:

            innovation_score = round(
                (
                    novelty * 0.30
                    + impact * 0.30
                    + feasibility * 0.20
                    + scalability * 0.20
                ) * 10
            )

            if innovation_score >= 80:

                category = (
                    "🚀 Very High Innovation Potential"
                )

            elif innovation_score >= 65:

                category = (
                    "✨ High Innovation Potential"
                )

            elif innovation_score >= 50:

                category = (
                    "📈 Moderate Innovation Potential"
                )

            else:

                category = (
                    "🔧 Needs Further Development"
                )

            st.subheader(
                "🎯 Innovation Assessment"
            )

            col1, col2 = st.columns(2)

            with col1:

                st.metric(
                    "Innovation Score",
                    f"{innovation_score}/100"
                )

            with col2:

                st.metric(
                    "Research Area",
                    research_area
                )

            st.progress(
                innovation_score / 100
            )

            st.success(category)

            st.subheader(
                "📊 Score Breakdown"
            )

            col1, col2 = st.columns(2)

            with col1:

                st.write(
                    f"**🆕 Novelty:** {novelty}/10"
                )

                st.progress(
                    novelty / 10
                )

                st.write(
                    f"**🌍 Potential Impact:** {impact}/10"
                )

                st.progress(
                    impact / 10
                )

            with col2:

                st.write(
                    f"**⚙️ Technical Feasibility:** "
                    f"{feasibility}/10"
                )

                st.progress(
                    feasibility / 10
                )

                st.write(
                    f"**📈 Scalability:** "
                    f"{scalability}/10"
                )

                st.progress(
                    scalability / 10
                )

            st.subheader(
                "💡 Innovation Insight"
            )

            st.info(
                f"""
                Your research idea in **{research_area}**
                received an innovation score of
                **{innovation_score}/100**.

                The score considers four dimensions:
                **novelty, potential impact, technical
                feasibility and scalability**.

                This is a preliminary research-planning
                indicator and not a formal scientific evaluation.
                """
            )


# =========================================================
# AI RESEARCH ASSISTANT
# =========================================================

def ai_assistant_page():

    st.markdown(
        '<div class="section-title">'
        '🤖 AI Research Assistant'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "Ask questions about research, funding, "
        "innovation and project development."
    )

    st.divider()

    for message in st.session_state.chat_history:

        with st.chat_message(
            message["role"]
        ):

            st.write(
                message["content"]
            )

    user_question = st.chat_input(
        "Ask something about research or funding..."
    )

    if user_question:

        with st.chat_message("user"):
            st.write(user_question)

        st.session_state.chat_history.append(
            {
                "role": "user",
                "content": user_question
            }
        )

        question = user_question.lower()

        if "funding" in question:

            answer = """
            💰 **Research Funding**

            Research funding can come from:

            • Government agencies
            • Universities
            • Private organizations
            • Research foundations
            • Technology companies

            Before applying, check:

            • Eligibility
            • Research area
            • Funding amount
            • Deadline
            • Required documents
            • Expected outcomes
            """

        elif "computer vision" in question:

            answer = """
            👁️ **Computer Vision Research**

            Potential research areas include:

            • Medical image analysis
            • Road damage detection
            • Object detection
            • Industrial defect detection
            • Human activity recognition
            • Autonomous systems
            """

        elif "machine learning" in question:

            answer = """
            🧠 **Machine Learning Research**

            Important areas include:

            • Deep learning
            • Explainable AI
            • Federated learning
            • Computer vision
            • NLP
            • Time-series prediction
            • Reinforcement learning
            """

        elif (
            "research topic" in question
            or "project idea" in question
        ):

            answer = """
            💡 **Research Topic Suggestions**

            Some AI/ML project areas are:

            • Road damage detection
            • Medical image classification
            • Industrial defect detection
            • Smart agriculture
            • Traffic analysis
            • Sign language recognition
            • Research recommendation systems
            """

        elif "innovation" in question:

            answer = """
            💡 **Innovation**

            Innovation can be evaluated using:

            • Novelty
            • Potential impact
            • Technical feasibility
            • Scalability
            • Existing research
            • Real-world usefulness
            """

        else:

            answer = """
            🤖 **Research Assistant**

            I can help with:

            🔬 Research topics
            💰 Research funding
            📚 Research papers
            💡 Innovation
            🧠 Machine Learning
            👁️ Computer Vision
            📊 Research trends

            Try asking:

            "Suggest research topics in computer vision"

            or

            "How can I find research funding?"
            """

        with st.chat_message("assistant"):
            st.write(answer)

        st.session_state.chat_history.append(
            {
                "role": "assistant",
                "content": answer
            }
        )

    if st.session_state.chat_history:

        if st.button(
            "🗑️ Clear Chat",
            use_container_width=True,
            key="clear_chat"
        ):

            st.session_state.chat_history = []

            st.rerun()


# =========================================================
# PROFILE PAGE
# =========================================================

def profile_page():

    user = st.session_state.user

    st.markdown(
        '<div class="section-title">'
        '👤 My Profile'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "View your account information and research preferences."
    )

    st.divider()

    st.title(
        f"👋 Welcome, {user['name']}!"
    )

    st.subheader(
        "📋 Account Information"
    )

    col1, col2 = st.columns(2)

    with col1:

        st.info(
            f"""
            **👤 Full Name**

            {user['name']}
            """
        )

    with col2:

        st.info(
            f"""
            **📧 Email**

            {user['email']}
            """
        )

    st.subheader(
        "🔬 Research Profile"
    )

    research_interest = user.get(
        "research_interest",
        "Not specified"
    )

    st.success(
        f"""
        **🎯 Research Interest**

        {research_interest}
        """
    )

    st.subheader(
        "🚀 Your Research Toolkit"
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "📚 Research",
            "Available"
        )

    with col2:
        st.metric(
            "💰 Funding",
            "Available"
        )

    with col3:
        st.metric(
            "🤖 AI Assistant",
            "Available"
        )


# =========================================================
# RESEARCH INTELLIGENCE
# =========================================================

def research_intelligence_page():

    st.markdown(
        '<div class="section-title">'
        '📚 Research Intelligence'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "Explore AI research statistics, "
        "publication trends and recent research."
    )

    st.divider()

    st.subheader(
        "📊 Research Statistics"
    )

    total_research = get_total_research()

    col1, col2, col3 = st.columns(3)

    with col1:

        st.metric(
            "🤖 Total AI Research Works",
            f"{total_research:,}"
        )

    with col2:

        st.metric(
            "🌐 Data Source",
            "OpenAlex"
        )

    with col3:

        st.metric(
            "🟢 Platform Status",
            "Online"
        )

    st.divider()

    st.subheader(
        "📰 Recent AI Research"
    )

    if st.button(
        "📰 Load Recent Research",
        type="primary",
        key="load_recent_research"
    ):

        try:

            response = requests.get(
                f"{BASE_URL}/api/research/recent",
                timeout=60
            )

            if response.status_code == 200:

                data = response.json()

                recent = data.get(
                    "recent_research",
                    []
                )

                if recent:

                    for i, research in enumerate(
                        recent,
                        start=1
                    ):

                        with st.container(
                            border=True
                        ):

                            st.markdown(
                                f"### {i}. "
                                f"{research.get('title', 'Untitled')}"
                            )

                            st.write(
                                f"📅 **Publication Date:** "
                                f"{research.get('publication_date', 'Unknown')}"
                            )

                            doi = research.get("doi")

                            if doi:

                                st.markdown(
                                    f"🔗 **DOI:** "
                                    f"[Open Research Paper]({doi})"
                                )

                else:

                    st.info(
                        "No recent research papers found."
                    )

            else:

                st.error(
                    "Unable to fetch recent research."
                )

        except Exception as e:

            st.error(
                f"Error loading recent research: {e}"
            )

    st.subheader(
        "📈 Research Publication Trends"
    )

    trend_df = get_research_trends()

    if not trend_df.empty:

        chart_df = (
            trend_df
            .set_index("Year")
            ["Research Works"]
        )

        st.line_chart(chart_df)

    else:

        st.info(
            "Research trend data is currently unavailable."
        )

    st.subheader(
        "💡 Research Insight"
    )

    st.info(
        """
        **AI Research Intelligence**

        OpenAlex data is used to analyze:

        • Research publication volume
        • Publication trends
        • Recent research activity
        • Overall AI research growth

        These insights help researchers understand
        how the research landscape is evolving.
        """
    )


# =========================================================
# HOME PAGE
# =========================================================

def home_page():

    user = st.session_state.user

    total_research = get_total_research()

    st.markdown(
        f"""
        <div class="hero">

            <h1>
                Discover. Fund. Innovate. 🚀
            </h1>

            <p>
                Welcome back, <b>{user['name']}</b>!
                Explore research, funding opportunities,
                emerging trends and innovation insights
                from one intelligent platform.
            </p>

        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="section-title">'
        '📊 Platform Overview'
        '</div>',
        unsafe_allow_html=True
    )

    total_funding = len(
        funding_opportunities
    )

    funding_areas = set()

    for opportunity in funding_opportunities:

        funding_areas.add(
            opportunity.get(
                "research_area",
                "Other"
            )
        )

    total_areas = len(funding_areas)

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        st.metric(
            "📚 Research Works",
            f"{total_research:,}"
        )

    with col2:

        st.metric(
            "💰 Funding Opportunities",
            total_funding
        )

    with col3:

        st.metric(
            "🔬 Research Areas",
            total_areas
        )

    with col4:

        st.metric(
            "🟢 Platform Status",
            "Online"
        )

    st.markdown(
        '<div class="section-title">'
        '🔍 Research Discovery'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "Search for research papers and explore "
        "research activity."
    )

    topic = st.text_input(
        "Search research topics",
        placeholder=(
            "Example: Artificial Intelligence, "
            "Computer Vision, Robotics..."
        ),
        label_visibility="collapsed",
        key="home_research_topic"
    )

    if st.button(
        "🔎 Search Research",
        type="primary",
        use_container_width=True,
        key="home_search_research"
    ):

        if topic.strip():
            search_research(topic)
        else:
            st.warning(
                "Please enter a research topic."
            )

    st.markdown(
        '<div class="section-title">'
        '📈 Research Publication Trends'
        '</div>',
        unsafe_allow_html=True
    )

    trend_df = get_research_trends()

    if not trend_df.empty:

        st.line_chart(
            trend_df.set_index(
                "Year"
            )["Research Works"]
        )

    st.markdown(
        '<div class="section-title">'
        '⚡ Quick Access'
        '</div>',
        unsafe_allow_html=True
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        with st.container(border=True):

            st.markdown(
                "### 📚 Research Intelligence"
            )

            st.write(
                "Explore AI research statistics, "
                "publication trends and recent papers."
            )

            if st.button(
                "Explore Research",
                key="home_research_button",
                use_container_width=True
            ):

                st.session_state.page = "research"
                st.rerun()

    with col2:

        with st.container(border=True):

            st.markdown(
                "### 💰 Funding Opportunities"
            )

            st.write(
                "Find research funding opportunities "
                "relevant to your work."
            )

            if st.button(
                "Explore Funding",
                key="home_funding_button",
                use_container_width=True
            ):

                st.session_state.page = "funding"
                st.rerun()

    with col3:

        with st.container(border=True):

            st.markdown(
                "### 💡 Innovation Score"
            )

            st.write(
                "Evaluate your research idea using "
                "multiple innovation indicators."
            )

            if st.button(
                "Calculate Score",
                key="home_innovation_button",
                use_container_width=True
            ):

                st.session_state.page = "innovation"
                st.rerun()

    col1, col2, col3 = st.columns(3)

    with col1:

        with st.container(border=True):

            st.markdown(
                "### 🔥 Trending Funding"
            )

            st.write(
                "Identify research areas with strong "
                "funding activity."
            )

            if st.button(
                "View Trends",
                key="home_trending_button",
                use_container_width=True
            ):

                st.session_state.page = "trending"
                st.rerun()

    with col2:

        with st.container(border=True):

            st.markdown(
                "### 🤖 AI Research Assistant"
            )

            st.write(
                "Ask questions about research, "
                "funding and innovation."
            )

            if st.button(
                "Ask Assistant",
                key="home_assistant_button",
                use_container_width=True
            ):

                st.session_state.page = "assistant"
                st.rerun()

    with col3:

        with st.container(border=True):

            st.markdown(
                "### 👤 My Profile"
            )

            st.write(
                "View your account information "
                "and research interests."
            )

            if st.button(
                "View Profile",
                key="home_profile_button",
                use_container_width=True
            ):

                st.session_state.page = "profile"
                st.rerun()

    st.markdown(
        '<div class="section-title">'
        '🚀 Platform Vision'
        '</div>',
        unsafe_allow_html=True
    )

    st.info(
        """
        **AI Research Intelligence Platform**

        This platform combines research discovery,
        funding intelligence, publication trends and
        innovation analysis into one centralized ecosystem.

        It helps researchers:

        • Discover relevant research
        • Explore funding opportunities
        • Analyze research trends
        • Evaluate research ideas
        • Get research guidance
        """
    )

    st.markdown(
        '<div class="section-title">'
        '🌐 Data & Intelligence'
        '</div>',
        unsafe_allow_html=True
    )

    col1, col2 = st.columns(2)

    with col1:

        st.success(
            """
            **📚 Research Data**

            Research publication information is retrieved
            using the **OpenAlex** research database.
            """
        )

    with col2:

        st.success(
            """
            **💰 Funding Intelligence**

            Funding opportunities are organized by:

            • Research area
            • Organization
            • Funding amount
            • Deadline
            • Eligibility
            """
        )


# =========================================================
# PATENT INTELLIGENCE
# =========================================================

def patent_search_page():

    st.markdown(
        '<div class="section-title">'
        '📜 Patent Intelligence'
        '</div>',
        unsafe_allow_html=True
    )

    st.write(
        "Search existing patents related to your research topic "
        "and explore innovation in your field."
    )

    st.divider()

    topic = st.text_input(
        "🔍 Search Patents",
        placeholder="Example: Artificial Intelligence",
        key="patent_search_topic"
    )

    if st.button(
        "🔎 Search Patents",
        type="primary",
        use_container_width=True,
        key="search_patents_button"
    ):

        if not topic.strip():

            st.warning(
                "Please enter a patent topic."
            )

        else:

            search_query = topic.strip().replace(
                " ",
                "+"
            )

            patent_url = (
                "https://patents.google.com/"
                "?q=" + search_query
            )

            st.success(
                f"Patent search ready for: **{topic}**"
            )

            st.link_button(
                "📜 Open Patent Search",
                patent_url,
                use_container_width=True
            )

            st.info(
                """
                💡 **Patent Intelligence**

                Use the patent database to investigate:

                • Existing inventions
                • Patent titles
                • Inventors
                • Organizations
                • Publication dates
                • Patent documents
                • Similar technologies

                This helps researchers identify existing
                innovations before developing a new research idea.
                """
            )


# =========================================================
# APPLICATION ENTRY POINT
# =========================================================

if st.session_state.page == "landing":

    # IMPORTANT:
    # No sidebar is shown on landing page.
    landing_page()


elif (
    st.session_state.page == "authentication"
    and not st.session_state.logged_in
):

    # IMPORTANT:
    # No sidebar is shown on login/signup page.
    authentication_page()


elif st.session_state.logged_in:

    # Sidebar appears only after login.
    navigation_sidebar()

    if st.session_state.page == "home":

        home_page()

    elif st.session_state.page == "research":

        research_intelligence_page()

    elif st.session_state.page == "funding":

        funding_page()

    elif st.session_state.page == "patents":

        patent_search_page()

    elif st.session_state.page == "trending":

        trending_funding_page()

    elif st.session_state.page == "innovation":

        innovation_score_page()

    elif st.session_state.page == "assistant":

        ai_assistant_page()

    elif st.session_state.page == "profile":

        profile_page()

    else:

        st.session_state.page = "home"
        st.rerun()


else:

    st.session_state.page = "authentication"
    st.rerun()