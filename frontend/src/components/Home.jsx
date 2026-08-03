import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <main
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <Hero />

        <FeatureCards />
      </main>

      <Footer />
    </>
  );
}

export default Home;