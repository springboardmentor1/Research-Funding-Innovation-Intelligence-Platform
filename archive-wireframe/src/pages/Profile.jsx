import Layout from "../components/Layout";
import { useState } from "react";

import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiBookOpen,
  FiAward,
  FiDollarSign,
  FiEdit3,
  FiSave
} from "react-icons/fi";

function Profile() {

  const storedUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: storedUser?.name || "Researcher",
    email: storedUser?.email || "Not provided",
    institution: storedUser?.institution || "Kingston Engineering College",
    department: storedUser?.department || "Research & Innovation",
    role: storedUser?.role || "Researcher",
    interests:
      storedUser?.interests ||
      "Artificial Intelligence, Machine Learning, Research Analytics"
  });

  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });

  };

  const handleSave = () => {

    const updatedUser = {
      ...storedUser,
      ...profile
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditing(false);
  };

  return (

    <Layout>

      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <div className="profile-header">

        <div className="profile-identity">

          <div className="profile-avatar">
            <FiUser />
          </div>

          <div>

            <h1>
              {profile.name}
            </h1>

            <p>
              {profile.role}
            </p>

            <span>
              Research Intelligence Platform
            </span>

          </div>

        </div>

        <button
          className="profile-edit-btn"
          onClick={() => {

            if (editing) {
              handleSave();
            } else {
              setEditing(true);
            }

          }}
        >

          {editing ? (
            <>
              <FiSave />
              Save Profile
            </>
          ) : (
            <>
              <FiEdit3 />
              Edit Profile
            </>
          )}

        </button>

      </div>


      {/* =====================================================
          RESEARCH OVERVIEW
      ===================================================== */}

      <div className="profile-section">

        <div className="profile-section-title">

          <h2>
            Research Overview
          </h2>

          <p>
            Your research activity across the platform
          </p>

        </div>


        <div className="profile-stat-grid">

          <div className="profile-stat-card">

            <FiBookOpen />

            <strong>
              Research
            </strong>

            <span>
              Publications
            </span>

          </div>


          <div className="profile-stat-card">

            <FiAward />

            <strong>
              Patents
            </strong>

            <span>
              Innovation records
            </span>

          </div>


          <div className="profile-stat-card">

            <FiDollarSign />

            <strong>
              Funding
            </strong>

            <span>
              Research projects
            </span>

          </div>


          <div className="profile-stat-card">

            <FiBriefcase />

            <strong>
              Organizations
            </strong>

            <span>
              Research institutions
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          PERSONAL INFORMATION
      ===================================================== */}

      <div className="profile-section">

        <div className="profile-section-title">

          <h2>
            Personal Information
          </h2>

          <p>
            Manage your research profile information
          </p>

        </div>


        <div className="profile-form-grid">


          <div className="profile-field">

            <label>
              Full Name
            </label>

            {editing ? (

              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
              />

            ) : (

              <div className="profile-value">
                <FiUser />
                {profile.name}
              </div>

            )}

          </div>


          <div className="profile-field">

            <label>
              Email
            </label>

            {editing ? (

              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
              />

            ) : (

              <div className="profile-value">
                <FiMail />
                {profile.email}
              </div>

            )}

          </div>


          <div className="profile-field">

            <label>
              Institution
            </label>

            {editing ? (

              <input
                name="institution"
                value={profile.institution}
                onChange={handleChange}
              />

            ) : (

              <div className="profile-value">
                <FiBriefcase />
                {profile.institution}
              </div>

            )}

          </div>


          <div className="profile-field">

            <label>
              Department
            </label>

            {editing ? (

              <input
                name="department"
                value={profile.department}
                onChange={handleChange}
              />

            ) : (

              <div className="profile-value">
                <FiBriefcase />
                {profile.department}
              </div>

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          RESEARCH INTERESTS
      ===================================================== */}

      <div className="profile-section">

        <div className="profile-section-title">

          <h2>
            Research Interests
          </h2>

          <p>
            Areas of research and innovation
          </p>

        </div>


        {editing ? (

          <textarea
            name="interests"
            value={profile.interests}
            onChange={handleChange}
            className="profile-interests-input"
          />

        ) : (

          <div className="research-interest-box">

            {profile.interests
              .split(",")
              .map((interest, index) => (

                <span key={index}>
                  {interest.trim()}
                </span>

              ))}

          </div>

        )}

      </div>


      <footer className="dashboard-footer">

        <strong>
          Research Funding & Innovation Intelligence Platform
        </strong>

        <br />

        <span>
          Researcher Profile
        </span>

      </footer>

    </Layout>

  );
}

export default Profile;