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

    let userState = userStates.get(userId);

    if (!userState) {
      // Если состояние пользователя не существует, создаем новый объект состояния
      userState = {
        isQueryProcessed: false,
        rightAnswer: word.translations[0].title,
        // Другие свойства состояния пользователя
      };
      userStates.set(userId, userState);
    }

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
        const userId = query.from.id;
        const command = query.data;
        bot.sendMessage(chatId, "Пипупа")
        let userState = userStates.get(userId);
      
        if (userState.isQueryProcessed) {
          return; // Игнорировать повторные вызовы
        }
      
        console.log("comand", command, "right", userState);
      
        if (command === userState.rightAnswer) {
          bot.sendMessage(chatId, "Правильно").then((sentMessage) => {
            const messageId = sentMessage.message_id;
            // sendRightAnswer(userId, word.id);
      
            const timeout = setTimeout(() => {
              bot.deleteMessage(chatId, messageId);
              bot.deleteMessage(chatId, quizId);
              clearTimeout(timeout);
            }, 1000);
          });
          userState.isQueryProcessed = true;
          return;
        }
        if (command !== userState.rightAnswer) {
          bot.sendMessage(chatId, "Не угадало").then((sentMessage) => {
            userState.isQueryProcessed = true;
            const messageId = sentMessage.message_id;
            // sendWrongAnswer(userId, word.id);
      
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

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
