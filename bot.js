const TelegramBot = require('node-telegram-bot-api');
 
// replace the value below with the Telegram token you receive from @BotFather
const token = require('./auth.json').token;
 
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const cfduel = require('./cfduel.js');

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
 
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id, "Welcome");
    
});

// bot.onText(/\/duel/, (msg) =>{
//   cfduel.duel(bot, msg);
// });
 
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  // var request = require('request');
  //   request('https://codeforces.com/contest/492/submission/29516826', function (error, response, body) {
  //   if (!error && response.statusCode == 200) {
  //     console.log(body);
  //    body = body.toString();
  //    var html = body.split('\n');
  //   }
  // });
  var args = msg.text.split(" ");
  if(args[0][0] == ';'){
    switch(args[0]){
      case ';duel':
        cfduel.duel(bot, msg);
      break; 
    }
    return;
  }
  const chatId = msg.chat.id;
  console.log(msg);
  // send a message to the chat acknowledging receipt of their message
  switch(msg.text){
    case 'ela':
      bot.sendMessage(chatId, 'bau');
      break;
  }
});
