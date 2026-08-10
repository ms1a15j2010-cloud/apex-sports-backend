// controllers/matchStandingsController.js

exports.getStandings = async (req, res) => {
  try {

    const standings = {
      homeTeam: {
        position: 1,
        played: 10,
        wins: 8,
        draws: 1,
        losses: 1,
        points: 25
      },

      awayTeam: {
        position: 5,
        played: 10,
        wins: 5,
        draws: 3,
        losses: 2,
        points: 18
      }
    };


    res.json({
      success: true,
      standings
    });


  } catch (error) {

    console.error("Standings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load standings"
    });

  }
};