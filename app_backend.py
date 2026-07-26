import requests
import streamlit as st

st.set_page_config(
    page_title="Backend API Tester",
    page_icon="🔧",
    layout="wide"
)

st.title("🔧 AI Research Platform - Backend API Tester")

st.write("Use this page to test the FastAPI backend and OpenAlex research APIs.")

BASE_URL = "http://127.0.0.1:8000"

# -------------------------------
# BACKEND HEALTH
# -------------------------------

st.header("Backend Connection")

if st.button("Test Backend Connection"):

    try:
        response = requests.get(
            f"{BASE_URL}/api/health",
            timeout=10
        )

        if response.status_code == 200:
            st.success("Backend is working correctly!")
            st.json(response.json())
        else:
            st.error(f"Backend returned status code {response.status_code}")

    except requests.exceptions.RequestException as e:
        st.error(f"Could not connect to backend: {e}")


# -------------------------------
# RESEARCH STATISTICS
# -------------------------------

st.header("Research Statistics")

if st.button("Get Research Statistics"):

    try:
        response = requests.get(
            f"{BASE_URL}/api/research/stats",
            timeout=30
        )

        if response.status_code == 200:

            data = response.json()

            st.metric(
                "Total AI Research Works",
                data["total_research_works"]
            )

        else:
            st.error("Unable to fetch research statistics")

    except requests.exceptions.RequestException as e:
        st.error(f"Error: {e}")


# -------------------------------
# RECENT RESEARCH
# -------------------------------

st.header("Recent Research")

if st.button("Get Recent Research"):

    try:
        response = requests.get(
            f"{BASE_URL}/api/research/recent",
            timeout=30
        )

        if response.status_code == 200:

            data = response.json()

            for research in data["recent_research"]:

                st.subheader(research["title"])

                st.write(
                    "Publication Date:",
                    research["publication_date"]
                )

                if research["doi"]:
                    st.write("DOI:", research["doi"])

                st.divider()

        else:
            st.error("Unable to fetch recent research")

    except requests.exceptions.RequestException as e:
        st.error(f"Error: {e}")


# -------------------------------
# RESEARCH SEARCH
# -------------------------------

st.header("Search Research Papers")

topic = st.text_input(
    "Enter a research topic:",
    placeholder="Example: machine learning"
)

if st.button("Search"):

    if topic:

        try:
            response = requests.get(
                f"{BASE_URL}/api/research/search",
                params={"topic": topic},
                timeout=30
            )

            if response.status_code == 200:

                data = response.json()

                st.write("Search results for:", data["topic"])

                for research in data["results"]:

                    st.subheader(research["title"])

                    st.write(
                        "Publication Year:",
                        research["publication_year"]
                    )

                    if research["doi"]:
                        st.write("DOI:", research["doi"])

                    st.divider()

            else:
                st.error("Unable to search research papers")

        except requests.exceptions.RequestException as e:
            st.error(f"Error: {e}")

    else:
        st.warning("Please enter a research topic")