-- Të dhëna fiktive për laboratorin; ekzekutohet në Neon SQL Editor.
CREATE TABLE IF NOT EXISTS profilet (
  github_id TEXT PRIMARY KEY,
  emri TEXT NOT NULL,
  roli TEXT NOT NULL DEFAULT 'udhetar'
    CHECK (roli IN ('udhetar', 'shofer'))
);

CREATE TABLE IF NOT EXISTS udhetimet (
  id TEXT PRIMARY KEY,
  nisja TEXT NOT NULL,
  destinacioni TEXT NOT NULL,
  ora TEXT NOT NULL CHECK (ora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  vendtakimi TEXT NOT NULL,
  vende INTEGER NOT NULL CHECK (vende >= 0),
  shofer_id TEXT REFERENCES profilet(github_id)
);

ALTER TABLE udhetimet
  ADD COLUMN IF NOT EXISTS shofer_id TEXT REFERENCES profilet(github_id);

INSERT INTO udhetimet (id, nisja, destinacioni, ora, vendtakimi, vende)
VALUES
  ('1', 'Prishtinë', 'AAB', '08:00', 'Stacioni i autobusëve', 2),
  ('2', 'Fushë Kosovë', 'AAB', '08:15', 'Te stacioni kryesor', 1),
  ('3', 'Lipjan', 'AAB', '07:45', 'Qendra e qytetit', 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS preferimet (
  github_id TEXT NOT NULL REFERENCES profilet(github_id) ON DELETE CASCADE,
  udhetimi_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (github_id, udhetimi_id)
);

CREATE TABLE IF NOT EXISTS kerkesat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  udhetimi_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  udhetar_id TEXT NOT NULL REFERENCES profilet(github_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ne pritje'
    CHECK (status IN ('ne pritje', 'pranuar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (udhetimi_id, udhetar_id)
);

CREATE INDEX IF NOT EXISTS kerkesat_udhetimi_status_created_idx
  ON kerkesat (udhetimi_id, status, created_at);

SELECT * FROM udhetimet ORDER BY id;
