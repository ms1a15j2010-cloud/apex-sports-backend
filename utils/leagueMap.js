/* =========================================================
   LEAGUE MAP
   ========================================================= */

const LEAGUES = {
  epl: 39,
  premierleague: 39,
  "premier-league": 39,
  eng: 39,
  england: 39,

  laliga: 140,
  "la-liga": 140,
  spain: 140,

  bundesliga: 78,
  germany: 78,

  seriea: 135,
  "serie-a": 135,
  italy: 135,

  ligue1: 61,
  "ligue-1": 61,
  france: 61,

  ucl: 2,
  championsleague: 2,
  "champions-league": 2,

  uel: 3,
  europa: 3,
  "europa-league": 3,

  worldcup: 1,
  "world-cup": 1,

  euro: 4,
  euros: 4,

  mls: 253,
  usa: 253,
};

/* =========================================================
   GET LEAGUE ID
   Accepts:

   /39
   /epl
   /EPL
   /premier-league
   ========================================================= */

function getLeagueId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  /* Numeric league ID */
  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  /* Normalize slug */
  const slug = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return LEAGUES[slug] || null;
}

/* =========================================================
   GET LEAGUE SLUG
   ========================================================= */

function getLeagueSlug(id) {
  const numericId = Number(id);

  for (const [slug, leagueId] of Object.entries(LEAGUES)) {
    if (leagueId === numericId) {
      return slug;
    }
  }

  return null;
}

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  LEAGUES,
  getLeagueId,
  getLeagueSlug,
};