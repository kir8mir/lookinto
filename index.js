

const botToken = '6297755833:AAE483mMv8u5F7B3J25IZor3S31266nCyMg';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(botToken);

const express = require('express');
const { exec } = require('child_process');
const notifier = require('node-notifier');

const app = express();
const port = 3330;

app.use(express.json());

app.post(`/bot${botToken}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', (msg) => {
  const { chat, text } = msg;

  if (chat.type === 'private') {
    // Отправка уведомления на macOS
    sendNotification('Новое личное сообщение', `Отправитель: ${chat.username}\nСообщение: ${text}`);
  }
});

function sendNotification(title, message) {
  notifier.notify({
    title: title,
    message: message,
  });
}

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  bot.setWebHook(`https://lookinto.onrender.com/bot${botToken}`);
});
