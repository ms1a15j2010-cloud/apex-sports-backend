module.exports = function formatTeam(team) {
  return {
    id: team.team.id,

    name: team.team.name,

    code: team.team.code,

    country: team.team.country,

    founded: team.team.founded,

    logo: team.team.logo,
  };
};