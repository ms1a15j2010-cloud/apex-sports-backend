module.exports = function formatEvent(event = {}) {
  return {
    id:
      event.id ??
      `${event.time?.elapsed}-${event.type}-${event.player?.id || "event"}`,

    time: {
      elapsed: event.time?.elapsed ?? 0,

      extra: event.time?.extra ?? 0,
    },

    team: {
      id: event.team?.id ?? null,

      name: event.team?.name ?? "Unknown Team",

      logo: event.team?.logo ?? "",
    },

    player: {
      id: event.player?.id ?? null,

      name: event.player?.name ?? "",
    },

    assist: {
      id: event.assist?.id ?? null,

      name: event.assist?.name ?? "",
    },

    type: event.type ?? "",

    detail: event.detail ?? "",

    comments: event.comments ?? "",
  };
};