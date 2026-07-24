# Database Schema Documentation

This document describes the database schema designed for the **Research Funding & Innovation Intelligence Platform**. The database uses PostgreSQL, adhering to standard normalization guidelines (up to 3NF) while ensuring modularity, scalability, and efficiency for AI-driven analytics.

---

## Entity Relationship Diagram (ERD)

The diagram below details the tables, columns, data types, primary keys (PK), foreign keys (FK), and relationships (One-to-One, One-to-Many, Many-to-Many).

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR email UNIQUE
        VARCHAR password_hash
        VARCHAR first_name
        VARCHAR last_name
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    roles {
        UUID id PK
        VARCHAR name UNIQUE
        TEXT description
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    user_roles {
        UUID user_id FK
        UUID role_id FK
        TIMESTAMP created_at
    }

    institutions {
        UUID id PK
        VARCHAR name
        VARCHAR country
        VARCHAR website
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    research_profiles {
        UUID id PK
        UUID user_id FK,UNIQUE
        VARCHAR title
        TEXT biography
        UUID institution_id FK
        VARCHAR orcid UNIQUE
        INT h_index
        INT citation_count
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    research_interests {
        INT id PK
        VARCHAR name UNIQUE
        TIMESTAMP created_at
    }

    profile_interests {
        UUID profile_id FK
        INT interest_id FK
    }

    funding_agencies {
        UUID id PK
        VARCHAR name
        VARCHAR website
        VARCHAR country
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    funding_opportunities {
        UUID id PK
        VARCHAR title
        TEXT description
        UUID sponsor_id FK
        NUMERIC amount
        VARCHAR currency
        TIMESTAMP deadline
        TIMESTAMP posted_date
        TEXT eligibility_criteria
        VARCHAR status
        VARCHAR url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    opportunity_interests {
        UUID opportunity_id FK
        INT interest_id FK
    }

    publications {
        UUID id PK
        VARCHAR title
        TEXT abstract
        VARCHAR doi UNIQUE
        VARCHAR journal
        DATE published_date
        INT citation_count
        VARCHAR url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    publication_authors {
        UUID publication_id FK
        UUID profile_id FK
        INT author_order
    }

    publication_interests {
        UUID publication_id FK
        INT interest_id FK
    }

    patents {
        UUID id PK
        VARCHAR title
        TEXT description
        VARCHAR patent_number UNIQUE
        VARCHAR status
        DATE filing_date
        DATE grant_date
        VARCHAR url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    patent_inventors {
        UUID patent_id FK
        UUID profile_id FK
    }

    patent_interests {
        UUID patent_id FK
        INT interest_id FK
    }

    innovation_scores {
        UUID id PK
        UUID profile_id FK,NULLABLE
        UUID institution_id FK,NULLABLE
        NUMERIC score
        NUMERIC publication_metric
        NUMERIC patent_metric
        NUMERIC funding_metric
        TIMESTAMP calculated_at
    }

    ai_recommendations {
        UUID id PK
        UUID user_id FK
        VARCHAR recommendation_type
        UUID recommended_opportunity_id FK,NULLABLE
        UUID recommended_profile_id FK,NULLABLE
        UUID recommended_publication_id FK,NULLABLE
        NUMERIC score
        TEXT explanation
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    users ||--o{ user_roles : "assigned"
    roles ||--o{ user_roles : "holds"
    
    users ||--o| research_profiles : "has"
    institutions ||--o{ research_profiles : "employs"
    research_profiles ||--o{ profile_interests : "expresses"
    research_interests ||--o{ profile_interests : "categories"
    
    funding_agencies ||--o{ funding_opportunities : "sponsors"
    funding_opportunities ||--o{ opportunity_interests : "tags"
    research_interests ||--o{ opportunity_interests : "categorizes"
    
    publications ||--o{ publication_authors : "has co-authors"
    research_profiles ||--o{ publication_authors : "authored"
    publications ||--o{ publication_interests : "tags"
    research_interests ||--o{ publication_interests : "categorizes"
    
    patents ||--o{ patent_inventors : "has inventors"
    research_profiles ||--o{ patent_inventors : "invented"
    patents ||--o{ patent_interests : "tags"
    research_interests ||--o{ patent_interests : "categorizes"
    
    innovation_scores }o--o| research_profiles : "scores"
    innovation_scores }o--o| institutions : "scores"
    
    ai_recommendations }o--|| users : "targeted to"
    ai_recommendations }o--o| funding_opportunities : "recommends"
    ai_recommendations }o--o| research_profiles : "recommends"
    ai_recommendations }o--o| publications : "recommends"
```

---

## Detailed Table Explanations

### Module 1: User Authentication & RBAC

#### 1. `roles`
* **Role**: Defines roles available for authorization in the application (e.g., `ADMIN`, `RESEARCHER`, `SPONSOR`, `INSTITUTION_REP`).
* **Columns**:
  * `id` (UUID, PK): Auto-generated unique identifier.
  * `name` (VARCHAR(50), UNIQUE, NOT NULL): The identifier name of the role.
  * `description` (TEXT): A description of the permissions/scope of this role.
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE): Auditing timestamps.

#### 2. `users`
* **Role**: Stores credentials and essential information of registered users.
* **Columns**:
  * `id` (UUID, PK): Auto-generated unique identifier.
  * `email` (VARCHAR(255), UNIQUE, NOT NULL): User email address used for login.
  * `password_hash` (VARCHAR(255), NOT NULL): Secure password hash.
  * `first_name` (VARCHAR(100), NOT NULL): First name.
  * `last_name` (VARCHAR(100), NOT NULL): Surname/last name.
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE): Auditing timestamps.

#### 3. `user_roles`
* **Role**: Junction table to support Many-to-Many mapping between users and roles (a user can hold multiple roles, e.g. a researcher who is also an institutional admin).
* **Columns**:
  * `user_id` (UUID, FK, PK part): References `users(id)` (On Delete Cascade).
  * `role_id` (UUID, FK, PK part): References `roles(id)` (On Delete Cascade).
  * `created_at` (TIMESTAMP WITH TIME ZONE).

---

### Module 2: Research Profile Management

#### 4. `institutions`
* **Role**: Stores names and locations of research institutions (universities, centers, private labs).
* **Columns**:
  * `id` (UUID, PK): Auto-generated unique identifier.
  * `name` (VARCHAR(255), NOT NULL): Name of the institution.
  * `country` (VARCHAR(100)): Geographic location.
  * `website` (VARCHAR(255)): URL of the institution.
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE).

#### 5. `research_profiles`
* **Role**: Extends the `users` table with academic credentials and metrics. Linked One-to-One with users.
* **Columns**:
  * `id` (UUID, PK): Unique identifier.
  * `user_id` (UUID, FK, UNIQUE, NOT NULL): References `users(id)` (On Delete Cascade).
  * `title` (VARCHAR(50)): Title (e.g., "Dr.", "Professor").
  * `biography` (TEXT): Biography summary.
  * `institution_id` (UUID, FK): Current affiliation, references `institutions(id)` (On Delete Set Null).
  * `orcid` (VARCHAR(19), UNIQUE): Official ORCID identification string.
  * `h_index` (INT): Calculated h-index (must be $\ge 0$).
  * `citation_count` (INT): Total citations (must be $\ge 0$).
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE).

#### 6. `research_interests`
* **Role**: Master vocabulary/taxonomy for topics, skills, and scientific keywords.
* **Columns**:
  * `id` (SERIAL, PK): Auto-incrementing identifier.
  * `name` (VARCHAR(100), UNIQUE, NOT NULL): e.g., "Deep Learning", "Immunology".
  * `created_at` (TIMESTAMP WITH TIME ZONE).

#### 7. `profile_interests`
* **Role**: Junction table representing a researcher's interests (Many-to-Many).
* **Columns**:
  * `profile_id` (UUID, FK, PK part): References `research_profiles(id)` (On Delete Cascade).
  * `interest_id` (INT, FK, PK part): References `research_interests(id)` (On Delete Cascade).

---

### Module 3: Funding Opportunities

#### 8. `funding_agencies`
* **Role**: Sponsors that post funding opportunities (e.g., NSF, Horizon Europe, Bill & Melinda Gates Foundation).
* **Columns**:
  * `id` (UUID, PK): Unique identifier.
  * `name` (VARCHAR(255), NOT NULL): Agency name.
  * `website` (VARCHAR(255)): Web portal link.
  * `country` (VARCHAR(100)): Home country of the agency.
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE).

#### 9. `funding_opportunities`
* **Role**: Grants and calls for proposals hosted on the platform.
* **Columns**:
  * `id` (UUID, PK): Unique identifier.
  * `title` (VARCHAR(255), NOT NULL): Grant title.
  * `description` (TEXT, NOT NULL): Detailed description.
  * `sponsor_id` (UUID, FK): Sponsoring agency, references `funding_agencies(id)` (On Delete Cascade).
  * `amount` (NUMERIC(15,2)): Sizable numeric format for funding capital ($\ge 0$).
  * `currency` (VARCHAR(3)): ISO 4217 Currency Code (default 'USD').
  * `deadline` (TIMESTAMP WITH TIME ZONE): Submission deadline.
  * `posted_date` (TIMESTAMP WITH TIME ZONE): When it was posted.
  * `eligibility_criteria` (TEXT): Text rules for applying.
  * `status` (VARCHAR(50)): Status constraint ('OPEN', 'CLOSED', 'ARCHIVED').
  * `url` (VARCHAR(500)): Original URL page.
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE).

#### 10. `opportunity_interests`
* **Role**: Many-to-Many linking opportunities to matching taxonomy tags for matchmaking queries.
* **Columns**:
  * `opportunity_id` (UUID, FK, PK part): References `funding_opportunities(id)` (On Delete Cascade).
  * `interest_id` (INT, FK, PK part): References `research_interests(id)` (On Delete Cascade).

---

### Module 4: Publication Management

#### 11. `publications`
* **Role**: Metadata of research papers, journals, and preprints.
* **Columns**:
  * `id` (UUID, PK): Unique identifier.
  * `title` (VARCHAR(500), NOT NULL): Article title.
  * `abstract` (TEXT): Paper abstract.
  * `doi` (VARCHAR(100), UNIQUE): Digital Object Identifier.
  * `journal` (VARCHAR(255)): Publisher name.
  * `published_date` (DATE): Publication date.
  * `citation_count` (INT): Total times cited ($\ge 0$).
  * `url` (VARCHAR(500)): Link to the paper.
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE).

#### 12. `publication_authors`
* **Role**: Many-to-Many mapping indicating who wrote which publication and their sequence in the author order.
* **Columns**:
  * `publication_id` (UUID, FK, PK part): References `publications(id)` (On Delete Cascade).
  * `profile_id` (UUID, FK, PK part): References `research_profiles(id)` (On Delete Cascade).
  * `author_order` (INT, NOT NULL): The order of appearance (e.g., 1 for primary author, 2 for co-author, etc., $\ge 1$).

#### 13. `publication_interests`
* **Role**: Many-to-Many mapping linking research keywords to publication topics.
* **Columns**:
  * `publication_id` (UUID, FK, PK part): References `publications(id)` (On Delete Cascade).
  * `interest_id` (INT, FK, PK part): References `research_interests(id)` (On Delete Cascade).

---

### Module 5: Patent Management

#### 14. `patents`
* **Role**: Intellectual property registrations filed or granted.
* **Columns**:
  * `id` (UUID, PK): Unique identifier.
  * `title` (VARCHAR(500), NOT NULL): Patent title.
  * `description` (TEXT): Overview description of the patent.
  * `patent_number` (VARCHAR(100), UNIQUE, NOT NULL): Registration identifier (e.g., US1234567B2).
  * `status` (VARCHAR(50)): File status check ('FILED', 'GRANTED', 'EXPIRED').
  * `filing_date` (DATE, NOT NULL): Filing submission date.
  * `grant_date` (DATE): Grant date (nullable for pending applications).
  * `url` (VARCHAR(500)): Patent office link.
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE).

#### 15. `patent_inventors`
* **Role**: Many-to-Many linking inventors to patents.
* **Columns**:
  * `patent_id` (UUID, FK, PK part): References `patents(id)` (On Delete Cascade).
  * `profile_id` (UUID, FK, PK part): References `research_profiles(id)` (On Delete Cascade).

#### 16. `patent_interests`
* **Role**: Many-to-Many linking patents to research/technology domain interests.
* **Columns**:
  * `patent_id` (UUID, FK, PK part): References `patents(id)` (On Delete Cascade).
  * `interest_id` (INT, FK, PK part): References `research_interests(id)` (On Delete Cascade).

---

### Module 6: Innovation Score

#### 17. `innovation_scores`
* **Role**: Tracks calculation metrics reflecting innovation standing for both individual researchers and institutions. Has an audit trail design by keeping historical entries.
* **Columns**:
  * `id` (UUID, PK): Unique identifier.
  * `profile_id` (UUID, FK, NULLABLE): Affiliated researcher, references `research_profiles(id)` (On Delete Cascade).
  * `institution_id` (UUID, FK, NULLABLE): Affiliated institution, references `institutions(id)` (On Delete Cascade).
  * `score` (NUMERIC(5,2), NOT NULL): Final computed score (between 0.00 and 100.00).
  * `publication_metric` (NUMERIC(5,2)): Evaluated publications metric score.
  * `patent_metric` (NUMERIC(5,2)): Evaluated patents metric score.
  * `funding_metric` (NUMERIC(5,2)): Evaluated funding metric score.
  * `calculated_at` (TIMESTAMP WITH TIME ZONE): Run date.
* **Check Constraints**:
  * `chk_score_owner`: Check constraint enforcing that exactly one of `profile_id` or `institution_id` is populated (`(profile_id IS NOT NULL AND institution_id IS NULL) OR (profile_id IS NULL AND institution_id IS NOT NULL)`).

---

### Module 7: AI Recommendations

#### 18. `ai_recommendations`
* **Role**: Logs recommendation inputs/outputs, confidence scores, and user behavior metrics (whether recommendations were accepted, rejected, or dismissed). This data is critical for refining and retraining recommendation models.
* **Columns**:
  * `id` (UUID, PK): Unique identifier.
  * `user_id` (UUID, FK, NOT NULL): Recipient of recommendations, references `users(id)` (On Delete Cascade).
  * `recommendation_type` (VARCHAR(50), NOT NULL): Typology filter ('FUNDING_OPPORTUNITY', 'COLLABORATOR', 'PUBLICATION').
  * `recommended_opportunity_id` (UUID, FK, NULLABLE): References `funding_opportunities(id)` (On Delete Cascade).
  * `recommended_profile_id` (UUID, FK, NULLABLE): References `research_profiles(id)` (On Delete Cascade).
  * `recommended_publication_id` (UUID, FK, NULLABLE): References `publications(id)` (On Delete Cascade).
  * `score` (NUMERIC(4,3), NOT NULL): Matching confidence score between 0.000 and 1.000.
  * `explanation` (TEXT): Natural language explanation for explainability (e.g. "Similar researchers in Quantum Science have applied...").
  * `status` (VARCHAR(50)): Feedback tracking status ('PENDING', 'ACCEPTED', 'REJECTED', 'DISMISSED').
  * `created_at` / `updated_at` (TIMESTAMP WITH TIME ZONE).
* **Check Constraints**:
  * `chk_recommendation_target`: Ensures that a recommendation type corresponds exactly with a populated target reference, while keeping other target references NULL.
