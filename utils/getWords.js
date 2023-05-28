const api = require("./api.js");
const getWords = async () => {
  const data = await api.get("/word");
  return await data.data;
};

module.exports = getWords;
