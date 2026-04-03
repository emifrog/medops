-- MedOps — Schéma initial
-- Base de données publique du médicament (ANSM)

-- Spécialités pharmaceutiques
CREATE TABLE medications (
  code_cis TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dci TEXT,
  dosage TEXT,
  forme TEXT,
  voie TEXT,
  labo TEXT,
  statut_amm TEXT,
  classe TEXT,
  code_atc TEXT,
  search_text TEXT,
  conservation TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compositions (DCI / substances actives)
CREATE TABLE substances (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code_cis TEXT NOT NULL REFERENCES medications(code_cis) ON DELETE CASCADE,
  dci TEXT NOT NULL,
  dosage TEXT,
  nature TEXT, -- SA (substance active) / FT (fraction thérapeutique)
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Présentations commerciales (codes CIP)
CREATE TABLE presentations (
  cip13 TEXT PRIMARY KEY,
  cip7 TEXT,
  code_cis TEXT NOT NULL REFERENCES medications(code_cis) ON DELETE CASCADE,
  libelle TEXT,
  prix TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interactions médicamenteuses (Thesaurus ANSM)
CREATE TABLE interactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  substance1 TEXT NOT NULL,
  substance2 TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('contre-indiquee','deconseillee','precaution','a-prendre-en-compte')),
  description TEXT,
  cat TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fiches surdosage / Conduite à tenir
CREATE TABLE surdosage (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dci TEXT NOT NULL UNIQUE,
  dose_toxique TEXT,
  symptomes TEXT[],
  cat TEXT[],
  antidote TEXT,
  gravite TEXT CHECK (gravite IN ('faible','moderee','elevee','vitale')),
  delai_action TEXT,
  orientation TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alertes de sécurité ANSM
CREATE TABLE alerts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code_cis TEXT NOT NULL REFERENCES medications(code_cis) ON DELETE CASCADE,
  date_debut DATE,
  date_fin DATE,
  texte TEXT,
  lien TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Métadonnées de version de la base
CREATE TABLE data_version (
  id INT PRIMARY KEY DEFAULT 1,
  version TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insérer la version initiale
INSERT INTO data_version (version) VALUES ('2026.03.29');

-- ═══════════════════════════════════════
-- INDEX
-- ═══════════════════════════════════════

CREATE INDEX idx_medications_name ON medications(name);
CREATE INDEX idx_medications_dci ON medications(dci);
CREATE INDEX idx_medications_atc ON medications(code_atc);
CREATE INDEX idx_medications_search ON medications USING gin(to_tsvector('french', coalesce(search_text, '')));

CREATE INDEX idx_presentations_cis ON presentations(code_cis);
CREATE INDEX idx_substances_cis ON substances(code_cis);
CREATE INDEX idx_substances_dci ON substances(dci);

CREATE INDEX idx_interactions_sub1 ON interactions(substance1);
CREATE INDEX idx_interactions_sub2 ON interactions(substance2);

CREATE INDEX idx_alerts_cis ON alerts(code_cis);
CREATE INDEX idx_surdosage_dci ON surdosage(dci);

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE substances ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE surdosage ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_version ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour toutes les tables (app client avec anon key)
CREATE POLICY "Public read medications" ON medications FOR SELECT USING (true);
CREATE POLICY "Public read substances" ON substances FOR SELECT USING (true);
CREATE POLICY "Public read presentations" ON presentations FOR SELECT USING (true);
CREATE POLICY "Public read interactions" ON interactions FOR SELECT USING (true);
CREATE POLICY "Public read surdosage" ON surdosage FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public read data_version" ON data_version FOR SELECT USING (true);
