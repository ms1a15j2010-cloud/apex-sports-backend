module.exports = function formatPrediction(prediction = {}) {
  return {
    winner: prediction.predictions?.winner ?? null,

    win_or_draw: prediction.predictions?.win_or_draw ?? false,

    under_over: prediction.predictions?.under_over ?? null,

    goals: prediction.predictions?.goals ?? {},

    advice: prediction.predictions?.advice ?? "",

    percent: prediction.predictions?.percent ?? {},

    comparison: prediction.comparison ?? {},

    teams: prediction.teams ?? {},

    league: prediction.league ?? {},
  };
};