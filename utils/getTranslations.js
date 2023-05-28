const api = require("./api.js");
const getTranslations = async () => {
  const data = await api.get("/translation");
  return await data.data;
};

module.exports = getTranslations;
