const axios = require("axios");

/* =========================================================
CONFIG
========================================================= */

const API_BASE =
  "https://v3.football.api-sports.io";

const API_KEY =
  process.env.API_FOOTBALL_KEY;

const CACHE_TIME = Number(
  process.env.API_CACHE_TIME || 60000
);

/* =========================================================
MEMORY CACHE
========================================================= */

const cache = new Map();

/* =========================================================
DAILY LIMIT STATE
========================================================= */

let dailyLimitReached = false;

/* =========================================================
CACHE KEY
========================================================= */

function cacheKey(
  endpoint,
  params = {}
) {
  return `${endpoint}:${JSON.stringify(params)}`;
}

/* =========================================================
CLEAR EXPIRED CACHE
========================================================= */

function clearExpiredCache() {
  const now = Date.now();

  for (
    const [key, value]
    of cache.entries()
  ) {
    if (
      now - value.time >
      CACHE_TIME
    ) {
      cache.delete(key);
    }
  }
}

/* =========================================================
SLEEP
========================================================= */

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/* =========================================================
DAILY LIMIT DETECTOR & RESPONSE HELPER
========================================================= */

function isDailyLimitError(
  response
) {
  if (!response) {
    return false;
  }

  const errors =
    response.errors;

  if (!errors) {
    return false;
  }

  const requestError =
    errors.requests ||
    errors.request ||
    "";

  return String(
    requestError
  )
    .toLowerCase()
    .includes(
      "request limit"
    );
}

function createDailyLimitResponse() {
  return {
    errors: {
      requests: "Request limit reached"
    },
    response: [],
    results: 0
  };
}

/* =========================================================
API GET
========================================================= */

async function apiGet(
  endpoint,
  params = {},
  retries = 2,
  options = {}
) {
  /* -------------------------------------------------------
  API KEY
  ------------------------------------------------------- */

  if (!API_KEY) {
    console.error(
      "❌ API_FOOTBALL_KEY is missing"
    );

    return options.fullResponse
      ? {}
      : [];
  }

  /* -------------------------------------------------------
  CACHE FIRST
  ------------------------------------------------------- */

  clearExpiredCache();

  const key =
    cacheKey(
      endpoint,
      {
        params,
        fullResponse:
          options.fullResponse === true,
      }
    );

  const cached =
    cache.get(key);

  if (cached) {
    console.log(
      `⚡ API cache hit: ${endpoint}`
    );

    return cached.data;
  }

  /* -------------------------------------------------------
  DAILY LIMIT
  ------------------------------------------------------- */

  if (dailyLimitReached) {
    console.warn(
      `🛑 API daily limit reached. No request made: ${endpoint}`
    );

    return options.fullResponse
      ? createDailyLimitResponse()
      : [];
  }

  /* -------------------------------------------------------
  REQUEST LOOP
  ------------------------------------------------------- */

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {
    try {
      console.log(
        `🌐 API Request ${endpoint} | Attempt ${
          attempt + 1
        }/${retries + 1}`
      );

      console.log(
        "Params:",
        params
      );

      const response =
        await axios.get(
          `${API_BASE}${endpoint}`,
          {
            params,

            timeout: 30000,

            headers: {
              "x-apisports-key":
                API_KEY,

              "x-rapidapi-key":
                API_KEY,
            },
          }
        );

      const responseData =
        response.data || {};

      console.log(
        "Endpoint:",
        endpoint
      );

      console.log(
        "Status:",
        response.status
      );

      console.log(
        "Results:",
        responseData.results
      );

      /* ---------------------------------------------------
      API ERROR
      --------------------------------------------------- */

      if (
        responseData.errors &&
        Object.keys(
          responseData.errors
        ).length > 0
      ) {
        console.warn(
          "⚠️ API-Football returned errors:",
          responseData.errors
        );

        /* -----------------------------------------------
        DAILY LIMIT
        ----------------------------------------------- */

        if (
          isDailyLimitError(
            responseData
          )
        ) {
          dailyLimitReached =
            true;

          console.error(
            "🛑 API DAILY REQUEST LIMIT REACHED"
          );

          console.error(
            "🛑 No more API requests will be attempted."
          );

          /*
           * Return the FULL response when requested.
           *
           * This is important because the controller
           * can now distinguish:
           *
           * empty result
           * from
           * API quota failure.
           */

          return options.fullResponse
            ? responseData
            : [];
        }
      }

      /* ---------------------------------------------------
      EXTRACT DATA
      --------------------------------------------------- */

      const result =
        options.fullResponse
          ? responseData
          : Array.isArray(
              responseData.response
            )
          ? responseData.response
          : [];

      /* ---------------------------------------------------
      CACHE SUCCESSFUL RESPONSE
      --------------------------------------------------- */

      const hasArrayData =
        Array.isArray(result) &&
        result.length > 0;

      const hasFullResponse =
        options.fullResponse &&
        responseData &&
        typeof responseData ===
          "object" &&
        !responseData.errors;

      if (
        hasArrayData ||
        hasFullResponse
      ) {
        cache.set(key, {
          time: Date.now(),
          data: result,
        });

        console.log(
          `💾 Cached successful response: ${endpoint}`
        );
      } else {
        console.warn(
          `⚠️ Empty response NOT cached: ${endpoint}`
        );
      }

      return result;

    } catch (error) {
      const status =
        error.response?.status;

      console.error(
        `❌ API ${endpoint}`,
        status ||
          error.message
      );

      /* -----------------------------------------------
      RATE LIMIT
      ----------------------------------------------- */

      if (
        status === 429
      ) {
        dailyLimitReached =
          true;

        console.error(
          "🛑 API DAILY REQUEST LIMIT REACHED"
        );

        return options.fullResponse
          ? createDailyLimitResponse()
          : [];
      }

      /* -----------------------------------------------
      AUTHORIZATION
      ----------------------------------------------- */

      if (
        status === 401 ||
        status === 403
      ) {
        console.error(
          "❌ API authorization/access error"
        );

        return options.fullResponse
          ? {}
          : [];
      }

      /* -----------------------------------------------
      RETRY
      ----------------------------------------------- */

      if (
        attempt < retries
      ) {
        const delay =
          Math.pow(
            2,
            attempt
          ) * 1000;

        console.log(
          `🔄 Retry ${
            attempt + 1
          }/${retries} after ${delay}ms`
        );

        await sleep(
          delay
        );

        continue;
      }
    }
  }

  return options.fullResponse
    ? {}
    : [];
}

/* =========================================================
CURRENT SEASON
========================================================= */

/*
 * IMPORTANT:
 *
 * DO NOT CALL API-FOOTBALL HERE.
 *
 * This function is configuration only.
 *
 * Calling /leagues to discover the season wastes
 * one API request every time the server starts.
 */

function getCurrentSeason() {
  const season = 2024;

  console.log(
    `📅 Using configured API-Football season: ${season}`
  );

  return season;
}

/* =========================================================
DAILY LIMIT STATUS
========================================================= */

function isDailyLimitReached() {
  return dailyLimitReached;
}

/* =========================================================
RESET DAILY LIMIT
========================================================= */

function resetDailyLimit() {
  dailyLimitReached =
    false;

  console.log(
    "🔓 API daily-limit flag reset"
  );
}

/* =========================================================
CLEAR CACHE
========================================================= */

function clearCache() {
  cache.clear();

  console.log(
    "🧹 Football API cache cleared"
  );
}

/* =========================================================
EXPORTS
========================================================= */

module.exports = {
  apiGet,
  clearCache,
  getCurrentSeason,
  isDailyLimitReached,
  resetDailyLimit,
};