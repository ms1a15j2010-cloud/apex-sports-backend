const { apiGet } = require("../services/footballApi");

const formatHeadToHead = require("../formatters/headToHeadFormatter");

/* =====================================================
   HEAD TO HEAD
===================================================== */

exports.getHeadToHead = async (req, res) => {
  try {
    const { home, away } = req.params;

    const response = await apiGet("/fixtures/headtohead", {
      h2h: `${home}-${away}`,
      last: 10,
    });

    const matches = Array.isArray(response)
      ? response.map(formatHeadToHead)
      : [];

    return res.json({
      success: true,
      count: matches.length,
      matches,
    });

  } catch (err) {
    console.error("HeadToHeadController:", err);

    return res.status(500).json({
      success: false,
      count: 0,
      matches: [],
      message: "Unable to load head-to-head",
    });
  }
};