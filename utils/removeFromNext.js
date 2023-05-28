const api = require("./api.js");

const removeFromNext = async (wordId, userId) => {
  await api.delete(`/next/${wordId}`, {
    userId
  });
};

module.exports = removeFromNext;
