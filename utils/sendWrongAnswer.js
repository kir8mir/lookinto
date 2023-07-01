const api = require("./api.js");

const sendWrongAnswer = async (userId, wordId) => {
  await api.post(`/userword/wrong/${userId}`, {
    wordId
  });

};

module.exports = sendWrongAnswer;
