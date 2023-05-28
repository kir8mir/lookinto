const api = require("./api.js");
const removeFromNext = require("./removeFromNext.js");

const addToUserWord = async (wordId, userId) => {
  await api.post(`/userword`, {
    wordId,
    userId
  });

  await removeFromNext(wordId, userId)
};

module.exports = addToUserWord;
