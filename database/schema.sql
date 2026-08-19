-- ==========================================
-- PostgreSQL Database Schema Design
-- Project: Research Funding & Innovation Intelligence Platform
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 0. Shared Trigger for updated_at Columns
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1. User Authentication & RBAC Module
-- ==========================================

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Roles Junction Table (Many-to-Many RBAC)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Triggers for Authentication
CREATE TRIGGER trigger_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 2. Research Profile Management Module
-- ==========================================

-- Institutions Table
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Profiles Table (Extends Users one-to-one)
CREATE TABLE research_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(50), -- Dr., Prof., Sr. Researcher etc.
    biography TEXT,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    orcid VARCHAR(19) UNIQUE, -- Format: 0000-0000-0000-0000
    h_index INT DEFAULT 0 CHECK (h_index >= 0),
    citation_count INT DEFAULT 0 CHECK (citation_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Interests / Keywords Table (Master List)
CREATE TABLE research_interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profile-Interests Junction Table (Many-to-Many)
CREATE TABLE profile_interests (
    profile_id UUID REFERENCES research_profiles(id) ON DELETE CASCADE,
    interest_id INT REFERENCES research_interests(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, interest_id)
);

-- Triggers for Profiles
CREATE TRIGGER trigger_institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_research_profiles_updated_at
    BEFORE UPDATE ON research_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 3. Funding Opportunities Module
-- ==========================================

-- Funding Agencies (Sponsors) Table
CREATE TABLE funding_agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Funding Opportunities Table
CREATE TABLE funding_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sponsor_id UUID REFERENCES funding_agencies(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    deadline TIMESTAMP WITH TIME ZONE,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    eligibility_criteria TEXT,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'ARCHIVED')),
    url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunity-Interests Junction Table (Many-to-Many)
CREATE TABLE opportunity_interests (
    opportunity_id UUID REFERENCES funding_opportunities(id) ON DELETE CASCADE,
    interest_id INT REFERENCES research_interests(id) ON DELETE CASCADE,
    PRIMARY KEY (opportunity_id, interest_id)
);

-- Triggers for Funding
CREATE TRIGGER trigger_funding_agencies_updated_at
    BEFORE UPDATE ON funding_agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_funding_opportunities_updated_at
    BEFORE UPDATE ON funding_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 4. Publication Management Module
-- ==========================================

-- Publications Table
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    doi VARCHAR(100) UNIQUE, -- Digital Object Identifier
    journal VARCHAR(255),
    published_date DATE,
    citation_count INT DEFAULT 0 CHECK (citation_count >= 0),
    url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Publication-Authors Junction Table (Many-to-Many)
CREATE TABLE publication_authors (
    publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES research_profiles(id) ON DELETE CASCADE,
    author_order INT NOT NULL CHECK (author_order > 0),
    PRIMARY KEY (publication_id, profile_id)
);

-- Publication-Interests Junction Table (Many-to-Many)
CREATE TABLE publication_interests (
    publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
    interest_id INT REFERENCES research_interests(id) ON DELETE CASCADE,
    PRIMARY KEY (publication_id, interest_id)
);

-- Triggers for Publications
CREATE TRIGGER trigger_publications_updated_at
    BEFORE UPDATE ON publications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 5. Patent Management Module
-- ==========================================

-- Patents Table
CREATE TABLE patents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    patent_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'FILED' CHECK (status IN ('FILED', 'GRANTED', 'EXPIRED')),
    filing_date DATE NOT NULL,
    grant_date DATE,
    url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patent-Inventors Junction Table (Many-to-Many)
CREATE TABLE patent_inventors (
    patent_id UUID REFERENCES patents(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES research_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (patent_id, profile_id)
);

-- Patent-Interests Junction Table (Many-to-Many)
CREATE TABLE patent_interests (
    patent_id UUID REFERENCES patents(id) ON DELETE CASCADE,
    interest_id INT REFERENCES research_interests(id) ON DELETE CASCADE,
    PRIMARY KEY (patent_id, interest_id)
);

-- Triggers for Patents
CREATE TRIGGER trigger_patents_updated_at
    BEFORE UPDATE ON patents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 6. Innovation Score Module
-- ==========================================

-- Innovation Scores Table (Polymorphic Relation via Nullable FKs + Check Constraint)
CREATE TABLE innovation_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES research_profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0.00 AND score <= 100.00),
    publication_metric NUMERIC(5, 2) DEFAULT 0.00 CHECK (publication_metric >= 0.00),
    patent_metric NUMERIC(5, 2) DEFAULT 0.00 CHECK (patent_metric >= 0.00),
    funding_metric NUMERIC(5, 2) DEFAULT 0.00 CHECK (funding_metric >= 0.00),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure score belongs to either a single profile OR a single institution, not both
    CONSTRAINT chk_score_owner CHECK (
        (profile_id IS NOT NULL AND institution_id IS NULL) OR
        (profile_id IS NULL AND institution_id IS NOT NULL)
    )
);


-- ==========================================
-- 7. AI Recommendations Module
-- ==========================================

-- AI Recommendations Table
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('FUNDING_OPPORTUNITY', 'COLLABORATOR', 'PUBLICATION')),
    
    -- Target References
    recommended_opportunity_id UUID REFERENCES funding_opportunities(id) ON DELETE CASCADE,
    recommended_profile_id UUID REFERENCES research_profiles(id) ON DELETE CASCADE,
    recommended_publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
    
    score NUMERIC(4, 3) NOT NULL CHECK (score >= 0.000 AND score <= 1.000),
    explanation TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure exactly one target reference matches the recommendation type
    CONSTRAINT chk_recommendation_target CHECK (
        (recommendation_type = 'FUNDING_OPPORTUNITY' AND recommended_opportunity_id IS NOT NULL AND recommended_profile_id IS NULL AND recommended_publication_id IS NULL) OR
        (recommendation_type = 'COLLABORATOR' AND recommended_opportunity_id IS NULL AND recommended_profile_id IS NOT NULL AND recommended_publication_id IS NULL) OR
        (recommendation_type = 'PUBLICATION' AND recommended_opportunity_id IS NULL AND recommended_profile_id IS NULL AND recommended_publication_id IS NOT NULL)
    )
);

-- Trigger for AI Recommendations
CREATE TRIGGER trigger_ai_recommendations_updated_at
    BEFORE UPDATE ON ai_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 8. Optimizing Indexes (Foreign Keys & Search Columns)
-- ==========================================

-- Authentication Indexes
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Research Profile Indexes
CREATE INDEX idx_research_profiles_institution_id ON research_profiles(institution_id);
CREATE INDEX idx_profile_interests_interest_id ON profile_interests(interest_id);

-- Funding Indexes
CREATE INDEX idx_funding_opportunities_sponsor_id ON funding_opportunities(sponsor_id);
CREATE INDEX idx_funding_opportunities_deadline ON funding_opportunities(deadline);
CREATE INDEX idx_funding_opportunities_status ON funding_opportunities(status);
CREATE INDEX idx_opportunity_interests_interest_id ON opportunity_interests(interest_id);

-- Publication Indexes
CREATE INDEX idx_publication_authors_profile_id ON publication_authors(profile_id);
CREATE INDEX idx_publication_interests_interest_id ON publication_interests(interest_id);
CREATE INDEX idx_publications_published_date ON publications(published_date);

-- Patent Indexes
CREATE INDEX idx_patent_inventors_profile_id ON patent_inventors(profile_id);
CREATE INDEX idx_patent_interests_interest_id ON patent_interests(interest_id);
CREATE INDEX idx_patents_filing_date ON patents(filing_date);

-- Innovation Score Indexes
CREATE INDEX idx_innovation_scores_profile_id ON innovation_scores(profile_id);
CREATE INDEX idx_innovation_scores_institution_id ON innovation_scores(institution_id);
CREATE INDEX idx_innovation_scores_calculated_at ON innovation_scores(calculated_at);

-- AI Recommendations Indexes
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX idx_ai_recommendations_score ON ai_recommendations(score);
