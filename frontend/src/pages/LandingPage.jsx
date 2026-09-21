import { Link } from "react-router-dom";
import "./LandingPage.css";

const ROLES = [
  {
    title: "Researchers",
    tag: "Discover & Score",
    desc: "Match your work against live funding opportunities, track research trends in your domain, and see your Innovation Score break down across five weighted factors.",
  },
  {
    title: "Startup Founders",
    tag: "Build & Commercialize",
    desc: "Spot emerging technology areas before they mature, scan the patent landscape for whitespace, and get concrete commercialization recommendations.",
  },
  {
    title: "Innovation Managers",
    tag: "Oversee & Direct",
    desc: "Get a portfolio-wide view across every researcher and domain — patent clusters, technology pipelines, and funding activity in one dashboard.",
  },
  {
    title: "Administrators",
    tag: "Manage & Monitor",
    desc: "Full user management, platform-wide analytics, and control over the funding and patent datasets that power every score on the platform.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-brand">RFIP</div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-ghost">Log In</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="panel-corner-tick" />
        <h1>Research Funding & Innovation Intelligence Platform</h1>
        <p className="landing-pitch">
          RFIP connects research profiles, live funding opportunities, patent data,
          and technology trend signals into a single Innovation Score —
          so researchers, founders, and innovation managers can see where a
          project actually stands, and what to do next.
        </p>
        <div className="landing-cta">
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
          <Link to="/login" className="btn btn-ghost btn-lg">I already have an account</Link>
        </div>
      </section>

      <section className="landing-roles">
        <h2>Built for every role in the innovation pipeline</h2>
        <div className="role-grid">
          {ROLES.map((r) => (
            <div className="role-card panel-corner-tick" key={r.title}>
              <span className="role-tag">{r.tag}</span>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <span>RFIP — Research Funding & Innovation Intelligence Platform</span>
      </footer>
    </div>
  );
}
