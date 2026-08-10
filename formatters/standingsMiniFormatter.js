module.exports = function formatStanding(team) {
  return {
    rank: team.rank,

    id: team.team.id,

    name: team.team.name,

    logo: team.team.logo,

    played: team.all.played,

    win: team.all.win,

    draw: team.all.draw,

    lose: team.all.lose,

    goalsFor: team.all.goals.for,

    goalsAgainst: team.all.goals.against,

    goalDifference: team.goalsDiff,

    points: team.points,
  };
};