exports.getSeason = (req) =>
  req.query.season || 2023;

exports.getLeague = (req) =>
  req.query.league || 39;