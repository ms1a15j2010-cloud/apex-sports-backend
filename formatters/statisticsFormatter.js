module.exports = function formatStatistics(stat = {}) {
  return {
    team: {
      id: stat.team?.id || null,

      name: stat.team?.name || "Unknown Team",

      logo: stat.team?.logo || "",
    },

    statistics: Array.isArray(stat.statistics)
      ? stat.statistics.map((item) => ({
          type: item.type || "",

          value:
            item.value === null || item.value === undefined
              ? 0
              : item.value,
        }))
      : [],
  };
};