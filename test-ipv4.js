const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const axios = require("axios");
require("dotenv").config();

(async () => {
  try {
    const res = await axios.get(
      "https://v3.football.api-sports.io/status",
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
          "x-apisports-host": process.env.API_HOST,
        },
      }
    );

    console.log(res.data);
  } catch (err) {
    console.log(err.response?.status);
    console.log(err.response?.data);
    console.log(err.message);
  }
})();