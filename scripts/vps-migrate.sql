-- Migration VPS Production : remplacement du champ `date` par `start_date` + `end_date`
-- Script idempotent : peut être exécuté plusieurs fois sans erreur.
-- Usage : psql $DATABASE_URL -f scripts/vps-migrate.sql

BEGIN;

-- 1. Ajouter start_date si elle n'existe pas encore
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE trips ADD COLUMN start_date TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Colonne start_date ajoutée.';
  ELSE
    RAISE NOTICE 'Colonne start_date déjà présente — ignorée.';
  END IF;
END $$;

-- 2. Ajouter end_date si elle n'existe pas encore
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE trips ADD COLUMN end_date TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Colonne end_date ajoutée.';
  ELSE
    RAISE NOTICE 'Colonne end_date déjà présente — ignorée.';
  END IF;
END $$;

-- 3. Si l'ancienne colonne `date` existe encore, migrer ses données
--    et la supprimer ensuite.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'date'
  ) THEN
    RAISE NOTICE 'Ancienne colonne date détectée — migration des données...';

    -- Exemple de migration naïve : on tente de découper "YYYY-MM-DD → YYYY-MM-DD"
    -- Si le champ ne contient pas ce format, on laisse start_date et end_date vides.
    UPDATE trips
    SET
      start_date = CASE
        WHEN "date" ~ '^\d{4}-\d{2}-\d{2}' THEN LEFT("date", 10)
        ELSE ''
      END,
      end_date = CASE
        WHEN "date" ~ '\d{4}-\d{2}-\d{2}$' THEN RIGHT("date", 10)
        ELSE ''
      END
    WHERE start_date = '' OR end_date = '';

    ALTER TABLE trips DROP COLUMN "date";
    RAISE NOTICE 'Colonne date supprimée.';
  ELSE
    RAISE NOTICE 'Ancienne colonne date absente — rien à migrer.';
  END IF;
END $$;

-- 4. Vérification finale
SELECT id, title, start_date, end_date FROM trips LIMIT 10;

COMMIT;
