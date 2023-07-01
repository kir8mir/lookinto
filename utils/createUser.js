const api = require("./api.js");

const createUser = async (user) => {
  await api.post(`/user`, user);
};

module.exports = createUser;
