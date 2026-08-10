const { apiGet } = require("../services/footballApi");
const formatPrediction = require("../formatters/predictionFormatter");
/* =====================================================
   MATCH PREDICTION
===================================================== */

exports.getPrediction = async (req, res) => {
  try {
    const fixtureId = req.params.id;

    const fixture = await apiGet("/fixtures", {
      id: fixtureId,
    });

    if (!fixture.length) {
      return res.json({
        success: false,
        prediction: null,
      });
    }

    const homeId = fixture[0].teams.home.id;
    const awayId = fixture[0].teams.away.id;

    const prediction = await apiGet("/predictions", {
      fixture: fixtureId,
    });

    return res.json({
      success: true,
      home: homeId,
      away: awayId,
      prediction: prediction.length
  ? formatPrediction(prediction[0])
  : null,
    });

  } catch (err) {
    console.error("PredictionController:", err);

    return res.status(500).json({
      success: false,
      prediction: null,
      message: "Unable to load prediction",
    });
  }
};