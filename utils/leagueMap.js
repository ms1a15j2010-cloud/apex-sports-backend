/* =========================================================
   LEAGUE MAP
   ========================================================= */

const LEAGUES = {
  // =========================================================
  // ENGLAND
  // =========================================================

  epl: 39,
  premierleague: 39,
  "premier-league": 39,
  eng: 39,
  england: 39,

  // =========================================================
  // SPAIN
  // =========================================================

  laliga: 140,
  "la-liga": 140,
  spain: 140,

  // =========================================================
  // GERMANY
  // =========================================================

  bundesliga: 78,
  germany: 78,

  // =========================================================
  // ITALY
  // =========================================================

  seriea: 135,
  "serie-a": 135,
  italy: 135,

  // =========================================================
  // FRANCE
  // =========================================================

  ligue1: 61,
  "ligue-1": 61,
  france: 61,

  // =========================================================
  // UEFA CHAMPIONS LEAGUE
  // =========================================================

  ucl: 2,
  championsleague: 2,
  "champions-league": 2,

  // =========================================================
  // UEFA EUROPA LEAGUE
  // =========================================================

  uel: 3,
  europa: 3,
  "europa-league": 3,

  // =========================================================
  // FIFA WORLD CUP
  // =========================================================

  worldcup: 1,
  "world-cup": 1,

  // =========================================================
  // UEFA EURO
  // =========================================================

  euro: 4,
  euros: 4,

  // =========================================================
  // COPA AMERICA
  // =========================================================

  copaamerica: 9,
  "copa-america": 9,

  // =========================================================
  // AFRICA CUP OF NATIONS
  // =========================================================

  afcon: 6,
  "africa-cup-of-nations": 6,
  "african-cup-of-nations": 6,

  // =========================================================
  // AFC ASIAN CUP
  // =========================================================

  "asian-cup": 17,
  "afc-asian-cup": 17,

  // =========================================================
  // CONCACAF GOLD CUP
  // =========================================================

  concacaf: 22,
  "concacaf-gold-cup": 22,
  goldcup: 22,
  "gold-cup": 22,

  // =========================================================
  // UEFA NATIONS LEAGUE
  // =========================================================

  nationsleague: 5,
  "nations-league": 5,
  "uefa-nations-league": 5,

  // =========================================================
  // CONMEBOL COPA LIBERTADORES
  // =========================================================

  libertadores: 13,
  "copa-libertadores": 13,

  // =========================================================
  // CONMEBOL COPA SUDAMERICANA
  // =========================================================

  sudamericana: 11,
  "copa-sudamericana": 11,

  // =========================================================
  // MLS
  // =========================================================

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
   /copa-america
   /9
   ========================================================= */

function getLeagueId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  /* =======================================================
     NUMERIC LEAGUE ID
     ======================================================= */

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  /* =======================================================
     NORMALIZE SLUG
     ======================================================= */

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

  /*
    Preferred public URL for each league.

    This prevents aliases such as:
      copaamerica
      copa-america

    from producing inconsistent URLs.
  */

  const preferredSlugs = {
    1: "world-cup",
    2: "champions-league",
    3: "europa-league",
    4: "euro",
    5: "nations-league",
    6: "africa-cup-of-nations",
    9: "copa-america",
    11: "copa-sudamericana",
    13: "copa-libertadores",
    17: "afc-asian-cup",
    22: "concacaf-gold-cup",
    39: "epl",
    61: "ligue-1",
    78: "bundesliga",
    135: "serie-a",
    140: "la-liga",
    253: "mls",
  };

  return preferredSlugs[numericId] || null;
}


/* =========================================================
   CHECK IF LEAGUE EXISTS
   ========================================================= */

function isValidLeague(value) {
  return getLeagueId(value) !== null;
}


/* =========================================================
   GET ALL LEAGUE ALIASES
   ========================================================= */

function getLeagueAliases(id) {
  const numericId = Number(id);

  return Object.entries(LEAGUES)
    .filter(([, leagueId]) => leagueId === numericId)
    .map(([slug]) => slug);
}


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  LEAGUES,
  getLeagueId,
  getLeagueSlug,
  isValidLeague,
  getLeagueAliases,
};