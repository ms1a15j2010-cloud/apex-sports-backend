module.exports = function formatPlayer(item) {
  return {
    id: item.player.id,

    name: item.player.name,

    photo: item.player.photo,

    team: {
      id: item.statistics[0].team.id,
      name: item.statistics[0].team.name,
      logo: item.statistics[0].team.logo,
    },

    goals:
      item.statistics[0].goals.total || 0,

    assists:
      item.statistics[0].goals.assists || 0,

    appearances:
      item.statistics[0].games.appearences || 0,
  };
};