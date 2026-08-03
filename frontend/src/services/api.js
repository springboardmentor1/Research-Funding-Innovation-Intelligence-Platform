import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// ======================
// Analytics
// ======================

export const getPublicationTrends = () =>
  API.get("/analytics/publication-trends");

export const getTopTopics = () =>
  API.get("/analytics/top-topics");

// ======================
// Research Papers
// ======================

export const getResearchPapers = (
  topic = "artificial intelligence"
) =>
  API.get(
    `/papers?topic=${encodeURIComponent(topic)}`
  );

// ======================
// Funding
// ======================

export const getFundingRecommendations = (
  topic
) =>
  API.post("/recommend-funding", {
    research_topic: topic,
  });

// ======================
// Patents
// ======================

export const getPatents = () =>
  API.get("/patents");

// ======================
// AI Assistant
// ======================

export const askAssistant = (question) =>
  API.post("/assistant", {
    question,
  });

// ======================
// Authentication
// ======================

export const signupUser = (userData) =>
  API.post("/signup", userData);

export const loginUser = (userData) =>
  API.post("/login", userData);

// ======================
// Bookmarks
// ======================

export const saveBookmark = (paper) =>
  API.post("/bookmarks", paper);

export const getBookmarks = () =>
  API.get("/bookmarks");

export const deleteBookmarks = () =>
  API.delete("/bookmarks");

export default API;