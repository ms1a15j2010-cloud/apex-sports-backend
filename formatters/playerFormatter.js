function formatPlayer(data) {
  if (!data) return null;

  const player = data.player?.player || {};
  const statistics = data.player?.statistics || [];

    return {
    id: player.id,

    name: player.name,

    firstname: player.firstname,

    lastname: player.lastname,

    age: player.age,

    nationality: player.nationality,

    height: player.height,

    weight: player.weight,

    injured: player.injured,

    photo: player.photo,

    birth: {
      date: player.birth?.date,
      place: player.birth?.place,
      country: player.birth?.country,
    },

    /* =========================
       CAREER / PERFORMANCE
    ========================= */

    statistics: statistics.map((stat) => ({
      league: {
        id: stat.league?.id,
        name: stat.league?.name,
        country: stat.league?.country,
        logo: stat.league?.logo,
        season: stat.league?.season,
      },

      team: {
        id: stat.team?.id,
        name: stat.team?.name,
        logo: stat.team?.logo,
      },

      games: {
        appearances:
          stat.games?.appearences ?? 0,

        lineups:
          stat.games?.lineups ?? 0,

        minutes:
          stat.games?.minutes ?? 0,

        number:
          stat.games?.number ?? null,

        position:
          stat.games?.position ?? "",

        rating:
          stat.games?.rating ?? "",
      },

      substitutes: {
        in:
          stat.substitutes?.in ?? 0,

        out:
          stat.substitutes?.out ?? 0,

        bench:
          stat.substitutes?.bench ?? 0,
      },

      shots: {
        total:
          stat.shots?.total ?? 0,

        on:
          stat.shots?.on ?? 0,
      },

      goals: {
        total:
          stat.goals?.total ?? 0,

        conceded:
          stat.goals?.conceded ?? 0,

        assists:
          stat.goals?.assists ?? 0,

        saves:
          stat.goals?.saves ?? 0,
      },

      passes: {
        total:
          stat.passes?.total ?? 0,

        key:
          stat.passes?.key ?? 0,

        accuracy:
          stat.passes?.accuracy ?? "",
      },

      tackles: {
        total:
          stat.tackles?.total ?? 0,

        blocks:
          stat.tackles?.blocks ?? 0,

        interceptions:
          stat.tackles?.interceptions ?? 0,
      },

      duels: {
        total:
          stat.duels?.total ?? 0,

        won:
          stat.duels?.won ?? 0,
      },

      dribbles: {
        attempts:
          stat.dribbles?.attempts ?? 0,

        success:
          stat.dribbles?.success ?? 0,

        past:
          stat.dribbles?.past ?? 0,
      },

      fouls: {
        drawn:
          stat.fouls?.drawn ?? 0,

        committed:
          stat.fouls?.committed ?? 0,
      },

      cards: {
        yellow:
          stat.cards?.yellow ?? 0,

        yellowred:
          stat.cards?.yellowred ?? 0,

        red:
          stat.cards?.red ?? 0,
      },

      penalty: {
        won:
          stat.penalty?.won ?? 0,

        committed:
          stat.penalty?.committed ??
          stat.penalty?.commited ??
          0,

        scored:
          stat.penalty?.scored ?? 0,

        missed:
          stat.penalty?.missed ?? 0,

        saved:
          stat.penalty?.saved ?? 0,
      },
    })),

    /* =========================
       CAREER
    ========================= */

    career: statistics,

    performance: statistics,

    /* =========================
       HISTORY / FIXTURES
    ========================= */

    history: [],

    fixtures: [],

    /* =========================
       TRANSFERS
    ========================= */

    transfers: Array.isArray(
      data.transfers
    )
      ? data.transfers
      : [],

    /* =========================
       TROPHIES
    ========================= */

    trophies: Array.isArray(
      data.trophies
    )
      ? data.trophies
      : [],
  };
}

module.exports = formatPlayer;