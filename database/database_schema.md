# Database Schema

## users

| Field      | Type         |
| ---------- | ------------ |
| id         | UUID         |
| full_name  | VARCHAR(100) |
| email      | VARCHAR(100) |
| password   | VARCHAR(255) |
| role       | VARCHAR(30)  |
| created_at | TIMESTAMP    |

---

## research_profiles

| Field           | Type         |
| --------------- | ------------ |
| id              | UUID         |
| user_id         | UUID         |
| research_domain | VARCHAR(100) |
| keywords        | TEXT         |
| organization    | VARCHAR(100) |
| biography       | TEXT         |

---

## publications

| Field      | Type         |
| ---------- | ------------ |
| id         | UUID         |
| profile_id | UUID         |
| title      | VARCHAR(255) |
| authors    | TEXT         |
| year       | INTEGER      |
| source     | VARCHAR(255) |

---

## patents

| Field             | Type         |
| ----------------- | ------------ |
| id                | UUID         |
| profile_id        | UUID         |
| patent_title      | VARCHAR(255) |
| assignee          | VARCHAR(255) |
| filing_date       | DATE         |
| technology_domain | VARCHAR(100) |

---

## funding_opportunities

| Field       | Type         |
| ----------- | ------------ |
| id          | UUID         |
| title       | VARCHAR(255) |
| provider    | VARCHAR(255) |
| eligibility | TEXT         |
| deadline    | DATE         |
| amount      | VARCHAR(50)  |

---

## notifications

| Field      | Type        |
| ---------- | ----------- |
| id         | UUID        |
| user_id    | UUID        |
| message    | TEXT        |
| status     | VARCHAR(20) |
| created_at | TIMESTAMP   |
