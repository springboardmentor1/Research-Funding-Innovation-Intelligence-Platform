-- Publications Table

CREATE TABLE publications (
    id INTEGER PRIMARY KEY,
    title TEXT,
    authors TEXT,
    year INTEGER
);

-- Funding Table

CREATE TABLE funding (
    id INTEGER PRIMARY KEY,
    title TEXT,
    organization TEXT,
    amount TEXT
);

-- Patent Table

CREATE TABLE patents (
    id INTEGER PRIMARY KEY,
    patent_number TEXT,
    title TEXT,
    organization TEXT
);