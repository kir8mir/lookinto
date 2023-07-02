const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

const botToken = "6297755833:AAE483mMv8u5F7B3J25IZor3S31266nCyMg";
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(botToken);

const getUpdate = require("./utils/getUpdate");
const gitHook = require("./utils/gitHook");
const getOneUser = require("./utils/getOneUser");
const sendRightAnswer = require("./utils/sendRightAnswer");
const sendWrongAnswer = require("./utils/sendWrongAnswer");
const createNewUser = require("./utils/createUser");

const app = new Koa();
const router = Router();
const port = 8443;
const url = "bot.tazasho.shop";

const userStates = new Map();

bot.setWebHook(`${url}/bot`);
router.post(`/githook`, gitHook);

const updateServer = async () => {
  bot.removeAllListeners("callback_query");
  userStates.clear();

  const usersActions = await getUpdate();
  for (const userAction of usersActions) {
    const { userId, fiveRandomTranslations, word } = userAction;

    const answers = [
      word.translations[0].title,
      fiveRandomTranslations[0].title,
      fiveRandomTranslations[1].title,
    ];
    function compareRandom() {
      return Math.random() - 0.5;
    }
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

    bot
      .sendMessage(userId, `Переведи слово: ${word.title}`, options)
      .then((sentMessage) => {
        const messageId = sentMessage.message_id;

        const timeout = setTimeout(() => {
          bot.deleteMessage(userId, messageId);
          clearTimeout(timeout);
        }, 60000);
      });

    bot.on("callback_query", (query) => {
      const chatId = query.message.chat.id;
      const quizId = query.message.message_id;
      const command = query.data;
      canSendNewMessage = true;

      let userState = userStates.get(userId);

      if (!userState) {
        // Если состояние пользователя не существует, создаем новый объект состояния
        userState = {
          isQueryProcessed: false,
          // Другие свойства состояния пользователя
        };
        userStates.set(userId, userState);
      }
      if (userState.isQueryProcessed) {
        return; // Игнорировать повторные вызовы
      }

      if (command === word.translations[0].title) {
        bot.sendMessage(chatId, "Правильно").then((sentMessage) => {
          const messageId = sentMessage.message_id;
          sendRightAnswer(userId, word.id);

          const timeout = setTimeout(() => {
            bot.deleteMessage(chatId, messageId);
            bot.deleteMessage(chatId, quizId);
            clearTimeout(timeout);
          }, 1000);
        });
        userState.isQueryProcessed = true;
      } 
       if (command !== word.translations[0].title) {
        bot.sendMessage(chatId, "Не угадало").then((sentMessage) => {
          userState.isQueryProcessed = true;
          const messageId = sentMessage.message_id;
          sendWrongAnswer(userId, word.id);

          const timeout = setTimeout(() => {
            bot.deleteMessage(chatId, messageId);
            bot.deleteMessage(chatId, quizId);

            clearTimeout(timeout);
          }, 1000);
        });
        userState.isQueryProcessed = true;
      }
    });
  }
};

router.post("/bot", (ctx) => {
  const { body } = ctx.request;
  bot.processUpdate(body);

  ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes());

const globalInterval = setInterval(() => {
  updateServer();
}, [300000]);

bot.on("message", (msg) => {
  const { chat, text, id } = msg;
  const chatId = chat.id;
  const messageId = msg.message_id;

  if (text === "/start") {
    (async () => {
      const isNewUser = await getOneUser(chatId);

      if (!isNewUser) {
        bot.sendMessage(chatId, `Привет, я бот для изучения английских слов`);
        createNewUser({
          id: chatId.toString(),
          password: "1",
          email: "mail",
          messageTimeCounter: 1,
        });
      } else {
        bot.sendMessage(chatId, "Привет, ты существуешь");
      }
    })();
  }
  if (text === "/site") {
    const link = `https://lookinto.vercel.app/${chatId}`;
    const message = `<a href="${link}">Дашборд</a>`;
    bot
      .sendMessage(chatId, message, { parse_mode: "HTML" })
      .then((sentMessage) => {
        const messageId = sentMessage.message_id;

        const timeout = setTimeout(() => {
          bot.deleteMessage(chatId, messageId);
          clearTimeout(timeout);
        }, 10000);
      });
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

  if (text[0] === "/") {
    bot.deleteMessage(chatId, messageId);
  }
});

// bot.onText(/\/go/, (msg) => {
//   const chatId = msg.chat.id.toString();
//   const messageId = msg.message_id;
//   bot.deleteMessage(chatId, messageId);

//   let canSendNewMessage = true;
//   setInterval(() => {
//     if (canSendNewMessage) {
//       canSendNewMessage = false;
//       bot.removeAllListeners("callback_query");

//       (async () => {
//         const words = await getUserWords(chatId);

//         const userNexts = await getAllUserNext(chatId);
//         const isHaveWords = words.length ? true : false;
//         const gates = isHaveWords ? words : userNexts;

//         const translations = await getTranslations();
//         const randomWordIndex = Math.floor(Math.random() * gates.length);
//         const currentWord = gates[randomWordIndex];
//         const showThisWord = await getOneWord(currentWord.wordId);

//         const { word, translation, translationId } = showThisWord;
//         const filteredTranslations = translations.filter(
//           (translation) => translation.id !== translationId
//         );
//         function compareRandom() {
//           return Math.random() - 0.5;
//         }
//         filteredTranslations.sort(compareRandom);
//         const answers = [
//           translation,
//           filteredTranslations[0].title,
//           filteredTranslations[1].title,
//         ];
//         answers.sort(compareRandom);

//         const options = {
//           reply_markup: {
//             inline_keyboard: [
//               [{ text: answers[0], callback_data: answers[0] }],
//               [{ text: answers[1], callback_data: answers[1] }],
//               [{ text: answers[2], callback_data: answers[2] }],
//             ],
//           },
//         };

//         bot.sendMessage(chatId, `Переведи слово: ${word}`, options);

//         bot.on("callback_query", (query) => {
//           const chatId = query.message.chat.id;
//           const messageId = query.message.message_id;
//           const command = query.data;
//           canSendNewMessage = true;
//           console.log("query", query);

//           if (command === translation) {
//             bot.sendMessage(chatId, "Правильно").then((sentMessage) => {
//               const messageId = sentMessage.message_id;

//               const timeout = setTimeout(() => {
//                 bot.deleteMessage(chatId, messageId);
//                 clearTimeout(timeout);
//               }, 1000);

//               addToNext(currentWord.wordId, chatId);
//             });
//           } else {
//             bot.sendMessage(chatId, "Не угадало").then((sentMessage) => {
//               const messageId = sentMessage.message_id;
//               const timeout = setTimeout(() => {
//                 bot.deleteMessage(chatId, messageId);
//                 clearTimeout(timeout);
//               }, 1000);
//             });

//             //если из Next
//             if (!isHaveWords) {
//               addToUserWord(currentWord.wordId, chatId);
//             }
//           }

//           bot.deleteMessage(chatId, messageId);
//         });
//       })();
//     }
//   }, 3000);
// });

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
