module.exports = function formatLeague(item) {
  return {
    id: item.league.id,

    name: item.league.name,

    type: item.league.type,

    logo: item.league.logo,

    country: item.country.name,

    flag: item.country.flag,

    season: item.seasons.find((s) => s.current)?.year || null,
  };
};