const api = require("./api.js");

const getUpdate = async () => {
  const data = await api.get("/api/update");
  return await data.data;
};

module.exports = getUpdate;
