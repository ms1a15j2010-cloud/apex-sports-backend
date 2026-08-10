// controllers/timelineController.js

exports.getTimeline = async (req, res) => {
  try {
    const timeline = [
      {
        minute: 12,
        type: "goal",
        team: "Home Team",
        player: "Player Name",
        description: "Goal scored"
      },
      {
        minute: 35,
        type: "yellow_card",
        team: "Away Team",
        player: "Player Name",
        description: "Yellow card"
      }
    ];

    res.json({
      success: true,
      timeline
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Timeline error"
    });
  }
};