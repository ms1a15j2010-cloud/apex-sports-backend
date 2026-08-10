require("dotenv").config();
const axios = require("axios");

async function test() {
  try {
    const res = await axios.get(
      "https://v3.football.api-sports.io/standings",
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
          "x-apisports-host": process.env.API_HOST,
        },
        params: {
          league: 39,
          season: 2024,
        },
      }
    );

    console.log(res.data);
  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    console.log("MESSAGE:", err.message);
  }
}

test();