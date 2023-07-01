const api = require("./api.js");

const sendRightAnswer = async (userId, wordId) => {
  await api.post(`/userword/right/${userId}`, {
    wordId
  });

};

module.exports = sendRightAnswer;
