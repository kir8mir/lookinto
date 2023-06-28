const { exec } = require('child_process');

const gitHook = async (ctx) => {
  // Выполнить команду git pull
  exec('git pull', (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка выполнения команды git pull: ${error}`);
      // Обработка ошибки при выполнении git pull
      ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
      return;
    } else {
      console.log(`Результат выполнения команды git pull: ${stdout}`);
      // Перезагрузить сервер (замените команду на соответствующую для вашей системы)
      exec('sudo pm2 restart index', (error) => {
        if (error) {
          console.error(`Ошибка при перезагрузке сервера: ${error}`);
          // Обработка ошибки при перезагрузке сервера
          ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
          return;
        } else {
          console.log('Сервер успешно перезагружен');
          // Отправить успешный HTTP-статус
          ctx.status = HttpStatus.OK;
          return;
        }
      });
    }
  });
}

module.exports = gitHook;