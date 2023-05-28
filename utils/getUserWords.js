const api = require("./api.js");
const getUserWords = async (userId) => {
  const data = await api.get(`/userword`);
  const userWords = data.data.filter(word => word.userId === userId);
  return await userWords;
};

module.exports = getUserWords;
