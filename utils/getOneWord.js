const api = require("./api.js");
const getOneWord = async (id) => {
  const res = await api.get(`/word/${id}`);
  const word = res.data.title;
  const translation = res.data.translations[0].title;
  const translationId = res.data.translations[0].id;

  return {word, translation, translationId};
};

module.exports = getOneWord;
