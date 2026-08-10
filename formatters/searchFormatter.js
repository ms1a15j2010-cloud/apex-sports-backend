function formatSearch(
  teams,
  players,
  leagues
) {

  return {

    teams: teams.map(team => ({
      id: team.team.id,
      name: team.team.name,
      logo: team.team.logo,
      country: team.team.country,
    })),

    players: players.map(player => ({
      id: player.player.id,
      name: player.player.name,
      photo: player.player.photo,

      team:
        player.statistics[0]?.team?.name || "",

      teamLogo:
        player.statistics[0]?.team?.logo || "",
    })),

    leagues: leagues.map(league => ({
      id: league.league.id,
      name: league.league.name,
      logo: league.league.logo,

      country:
        league.country.name,
    })),
  };
}

module.exports = formatSearch;