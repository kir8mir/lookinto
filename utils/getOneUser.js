const api = require("./api.js");

const getOneUser = async (userId) => {
  const res = await api.get(`/user/${userId}`);
  const singleUser = res.data;

  return singleUser;
};

module.exports = getOneUser;
