const NodeCache = require("node-cache");

const cache = new NodeCache({
  stdTTL: 120,
});

module.exports = (keyPrefix) => {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.originalUrl}`;

    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    const original = res.json;

    res.json = (body) => {
      cache.set(key, body);
      original.call(res, body);
    };

    next();
  };
};