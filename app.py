import streamlit as st
import requests

st.set_page_config(
    page_title="AI Research Funding & Innovation Intelligence Platform",
    page_icon="🤖",
    layout="wide"
)

BASE_URL = "http://127.0.0.1:8000"

st.title("🤖 AI Research Funding & Innovation Intelligence Platform")

st.write(
    "Research intelligence platform for exploring AI publications "
    "and research trends."
)

st.success("Streamlit frontend is working!")

st.header("🔗 Backend Connection")

if st.button("Test Backend Connection"):
    try:
        response = requests.get(
            f"{BASE_URL}/api/health",
            timeout=10
        )

        if response.status_code == 200:
            st.success("Frontend connected to backend successfully!")
            st.json(response.json())
        else:
            st.error(f"Backend returned status code: {response.status_code}")

    except Exception as e:
        st.error(f"Could not connect to backend: {e}")


st.header("📊 Research Analytics")

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

    except Exception as e:
        st.error(f"Error: {e}")


st.header("🔍 Research Topic Search")

topic = st.text_input(
    "Enter a research topic:",
    placeholder="Example: machine learning"
)

if st.button("Search Research"):
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

        except Exception as e:
            st.error(f"Error: {e}")

    else:
        st.warning("Please enter a research topic")