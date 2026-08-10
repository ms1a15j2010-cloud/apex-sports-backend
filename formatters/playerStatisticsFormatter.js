module.exports = function formatPlayerStatistics(team = {}) {
  return {
    team: {
      id: team.team?.id ?? null,

      name: team.team?.name ?? "Unknown Team",

      logo: team.team?.logo ?? "",
    },

    players: Array.isArray(team.players)
      ? team.players.map((item) => ({
          player: {
            id: item.player?.id ?? null,

            name: item.player?.name ?? "",

            photo: item.player?.photo ?? "",

            number: item.player?.number ?? null,

            pos: item.player?.pos ?? "",
          },

          statistics: Array.isArray(item.statistics)
            ? item.statistics
            : [],
        }))
      : [],
  };
};