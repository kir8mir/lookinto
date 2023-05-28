const api = require("./api.js");

const removeFromUserWord = async (wordId, userId) => {
  await api.delete(`/userword/${wordId}`, {
    userId
  });
};

module.exports = removeFromUserWord;
