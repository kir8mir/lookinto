const api = require("./api.js");

const getAllUserNext = async (userId) => {
  const res = await api.get(`/next`);
  const nextWords = res.data.filter(word => word.userId === userId.toString());

  return nextWords;
};

module.exports = getAllUserNext;
