module.exports = function formatLineup(lineup = {}) {
  return {
    team: {
      id: lineup.team?.id ?? null,
      name: lineup.team?.name ?? "Unknown",
      logo: lineup.team?.logo ?? null,
      colors: lineup.team?.colors ?? {},
    },

    coach: {
      id: lineup.coach?.id ?? null,
      name: lineup.coach?.name ?? "",
      photo: lineup.coach?.photo ?? null,
    },

    formation: lineup.formation ?? "",

    startXI: (lineup.startXI || []).map((player) => ({
      id: player.player?.id ?? null,
      name: player.player?.name ?? "",
      number: player.player?.number ?? null,
      pos: player.player?.pos ?? "",
      grid: player.player?.grid ?? "",
    })),

    substitutes: (lineup.substitutes || []).map((player) => ({
      id: player.player?.id ?? null,
      name: player.player?.name ?? "",
      number: player.player?.number ?? null,
      pos: player.player?.pos ?? "",
      grid: player.player?.grid ?? "",
    })),
  };
};