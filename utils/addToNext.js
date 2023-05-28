const api = require("./api.js");
const removeFromUserWord = require("./removeFromUserWord.js");

const addToNext = async (wordId, userId) => {
  await api.post(`/next`, {
    wordId,
    userId
  });

  await removeFromUserWord(wordId, userId)
};

module.exports = addToNext;
