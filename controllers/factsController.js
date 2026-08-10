// controllers/factsController.js

exports.getFacts = async (req, res) => {
  try {

    const facts = {
      highestScoringTeam: "Home Team",
      biggestWin: "3-0",
      totalGoals: 5,
      cleanSheets: {
        home: 2,
        away: 1
      },
      averageGoals: 2.5,
      lastMeeting: "Home Team won 2-1"
    };


    res.json({
      success: true,
      facts
    });


  } catch (error) {

    console.error("Facts Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load match facts"
    });

  }
};