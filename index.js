const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

const botToken = "6297755833:AAE483mMv8u5F7B3J25IZor3S31266nCyMg";
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(botToken);

const getWords = require("./utils/getWords");
const getOneWord = require("./utils/getOneWord");
const getUserWords = require("./utils/getUserWords");
const getAllUserNext = require("./utils/getOneUser");
const getTranslations = require("./utils/getTranslations");
const addToNext = require("./utils/addToNext");
const addToUserWord = require("./utils/addToUserWord");
const getUpdate = require("./utils/getUpdate");
const gitHook = require("./utils/gitHook");
const getOneUser = require("./utils/getOneUser");

const app = new Koa();
const router = Router();
const port = 8443;
const url = "bot.tazasho.shop";

bot.setWebHook(`${url}/bot`);
router.post(`/githook`, gitHook);

const updateServer = (userId) => {
  const id = userId || "387019250";

  (async () => {
    const userAction = await getUpdate();
    bot.sendMessage(
      id,
      `Сервер обновлен для пользователя ${JSON.stringify(userAction)}`
    );
  })();
};

router.post("/bot", (ctx) => {
  const { body } = ctx.request;
  bot.processUpdate(body);

  ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes());

// const globalInterval = setInterval(() => {
//   updateServer();
// }, [300000])

bot.on("message", (msg) => {
  const { chat, text } = msg;
  const chatId = chat.id;

  if (text === "/start") {
    (async () => {
      const isNewUser = await getOneUser(chatId);

      if (!isNewUser) {
        bot.sendMessage(chatId, `Привет, я бот для изучения английских слов`);
      } else {
        bot.sendMessage(chatId, "Привет, ты существуешь");
      }
    })();
  }
  if (text === "/site") {
    const link = `http://89.40.2.236:3030/`;
    const message = `<a href="${link}">Дашборд</a>`;
    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  }

  if (text.includes("/add")) {
    const whishThisNewWord = text.split("/add");
    bot.sendMessage(
      chat.id,
      `Новое личное сообщение\nОтправитель: ${chat.username}\nСообщение: ${msg.chat.id}`
    );
  }

  if (text === "/update") {
    updateServer();
  }
});

bot.onText(/\/go/, (msg) => {
  const chatId = msg.chat.id.toString();
  const messageId = msg.message_id;
  bot.deleteMessage(chatId, messageId);

  let canSendNewMessage = true;
  setInterval(() => {
    if (canSendNewMessage) {
      canSendNewMessage = false;
      bot.removeAllListeners("callback_query");

      (async () => {
        const words = await getUserWords(chatId);

        const userNexts = await getAllUserNext(chatId);
        const isHaveWords = words.length ? true : false;
        const gates = isHaveWords ? words : userNexts;

        const translations = await getTranslations();
        const randomWordIndex = Math.floor(Math.random() * gates.length);
        const currentWord = gates[randomWordIndex];
        const showThisWord = await getOneWord(currentWord.wordId);

        const { word, translation, translationId } = showThisWord;
        const filteredTranslations = translations.filter(
          (translation) => translation.id !== translationId
        );
        function compareRandom() {
          return Math.random() - 0.5;
        }
        filteredTranslations.sort(compareRandom);
        const answers = [
          translation,
          filteredTranslations[0].title,
          filteredTranslations[1].title,
        ];
        answers.sort(compareRandom);

        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: answers[0], callback_data: answers[0] }],
              [{ text: answers[1], callback_data: answers[1] }],
              [{ text: answers[2], callback_data: answers[2] }],
            ],
          },
        };

        bot.sendMessage(chatId, `Переведи слово: ${word}`, options);

        bot.on("callback_query", (query) => {
          const chatId = query.message.chat.id;
          const messageId = query.message.message_id;
          const command = query.data;
          canSendNewMessage = true;
          console.log("query", query);

          if (command === translation) {
            bot.sendMessage(chatId, "Правильно").then((sentMessage) => {
              const messageId = sentMessage.message_id;

              const timeout = setTimeout(() => {
                bot.deleteMessage(chatId, messageId);
                clearTimeout(timeout);
              }, 1000);

              addToNext(currentWord.wordId, chatId);
            });
          } else {
            bot.sendMessage(chatId, "Не угадало").then((sentMessage) => {
              const messageId = sentMessage.message_id;
              const timeout = setTimeout(() => {
                bot.deleteMessage(chatId, messageId);
                clearTimeout(timeout);
              }, 1000);
            });

            //если из Next
            if (!isHaveWords) {
              addToUserWord(currentWord.wordId, chatId);
            }
          }

          bot.deleteMessage(chatId, messageId);
        });
      })();
    }
  }, 3000);
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
