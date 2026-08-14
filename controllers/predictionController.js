const {
  getMatch,
} = require("../services/footballDataApi");

/* =====================================================
MATCH PREDICTION CONTROLLER

IMPORTANT:

This controller NO LONGER uses:

services/footballApi.js

Old API-Football endpoint:

/predictions

football-data.org does not provide an equivalent
prediction endpoint.

Therefore Apex Sports returns:

prediction: null

with:

predictionAvailable: false

We never generate fake probabilities or predictions.
===================================================== */


/* =====================================================
GET MATCH PREDICTION
=====================================================

GET:

/api/prediction/:id

or, through Match routes:

/api/match/:id/prediction
===================================================== */

exports.getPrediction =
  async (req, res) => {
    const fixtureId =
      req.params.id;

    try {
      /* =============================================
         VALIDATE MATCH ID
      ============================================= */

      if (!fixtureId) {
        return res.status(400).json({
          success: false,

          fixtureId: null,

          home: null,

          away: null,

          prediction: null,

          predictionAvailable:
            false,

          source:
            "football-data.org",

          message:
            "Match ID is required",
        });
      }

      console.log(
        `🔮 Checking prediction availability | Match: ${fixtureId}`
      );

      /* =============================================
         LOAD MATCH

         We still verify that the match exists and
         obtain the participating teams.
      ============================================= */

      const match =
        await getMatch(
          fixtureId
        );

      if (
        !match ||
        !match.id
      ) {
        return res.status(404).json({
          success: false,

          fixtureId,

          home: null,

          away: null,

          prediction: null,

          predictionAvailable:
            false,

          source:
            "football-data.org",

          message:
            "Match not found",
        });
      }

      /* =============================================
         TEAM INFORMATION
      ============================================= */

      const homeId =
        match.homeTeam?.id ??
        null;

      const awayId =
        match.awayTeam?.id ??
        null;

      const homeName =
        match.homeTeam?.name ||
        match.homeTeam?.shortName ||
        "Home Team";

      const awayName =
        match.awayTeam?.name ||
        match.awayTeam?.shortName ||
        "Away Team";

      /* =============================================
         RESPONSE

         There is no provider prediction model.
      ============================================= */

      return res.json({
        success: true,

        fixtureId:
          Number(fixtureId) ||
          fixtureId,

        home: {
          id:
            homeId,

          name:
            homeName,
        },

        away: {
          id:
            awayId,

          name:
            awayName,
        },

        prediction: null,

        predictionAvailable:
          false,

        source:
          "football-data.org",

        message:
          "Prediction data is not provided by football-data.org",
      });
    } catch (error) {
      console.error(
        "❌ PredictionController football-data.org:",
        error.response?.data ||
          error.message
      );

      /* =============================================
         RATE LIMIT
      ============================================= */

      if (
        error.response?.status ===
        429
      ) {
        return res.status(503).json({
          success: false,

          fixtureId,

          home: null,

          away: null,

          prediction: null,

          predictionAvailable:
            false,

          source:
            "football-data.org",

          apiLimitReached:
            true,

          message:
            "Football-data.org request limit reached. Please try again later.",
        });
      }

      /* =============================================
         GENERAL ERROR
      ============================================= */

      return res.status(500).json({
        success: false,

        fixtureId,

        home: null,

        away: null,

        prediction: null,

        predictionAvailable:
          false,

        source:
          "football-data.org",

        message:
          "Unable to load prediction information",

        error:
          error.response?.data ||
          error.message,
      });
    }
  };