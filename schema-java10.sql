-- Java 10: kërkesa të ruajtura dhe pranim atomik në Neon.
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
