module.exports = function formatTopScorer(player) {
  return {
    id: player.player?.id,

    name: player.player?.name,

    firstname: player.player?.firstname,

    lastname: player.player?.lastname,

    age: player.player?.age,

    nationality: player.player?.nationality,

    photo: player.player?.photo,

    team: {
      id: player.statistics?.[0]?.team?.id,
      name: player.statistics?.[0]?.team?.name,
      logo: player.statistics?.[0]?.team?.logo,
    },

    league: {
      id: player.statistics?.[0]?.league?.id,
      name: player.statistics?.[0]?.league?.name,
      logo: player.statistics?.[0]?.league?.logo,
    },

    games: player.statistics?.[0]?.games?.appearences ?? 0,

    minutes: player.statistics?.[0]?.games?.minutes ?? 0,

    goals: player.statistics?.[0]?.goals?.total ?? 0,

    assists: player.statistics?.[0]?.goals?.assists ?? 0,

    penalties: player.statistics?.[0]?.penalty?.scored ?? 0,

    rating: player.statistics?.[0]?.games?.rating ?? null,
  };
};