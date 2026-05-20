CREATE DATABASE bharatvote;
USE bharatvote;

-- Voters table (phone = unique identity, prevents duplicate voting)
CREATE TABLE voters (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  phone      VARCHAR(15) UNIQUE NOT NULL,
  otp        VARCHAR(6),
  otp_expiry DATETIME,
  has_voted  BOOLEAN DEFAULT FALSE,
  voted_at   TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parties table
CREATE TABLE parties (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  abbr       VARCHAR(10) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  vote_count INT DEFAULT 0
);

-- Votes table (one row per vote, phone is UNIQUE to block duplicates)
CREATE TABLE votes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  phone      VARCHAR(15) UNIQUE NOT NULL,
  party_id   INT NOT NULL,
  voted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  FOREIGN KEY (party_id) REFERENCES parties(id)
);

-- Seed parties
INSERT INTO parties (abbr, name) VALUES
  ('INC', 'Indian National Congress'),
  ('BJP', 'Bharatiya Janata Party'),
  ('AAP', 'Aam Aadmi Party'),
  ('VCK', 'Viduthalai Chiruthaigal Katchi'),
  ('CJP', 'Cockroach Janta Party');