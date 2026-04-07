-- Ajout du champ indication en langage simple
ALTER TABLE surdosage ADD COLUMN IF NOT EXISTS indication TEXT;
