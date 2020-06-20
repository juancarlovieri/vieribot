const fs = require("fs");
var obj = JSON.parse(fs.readFileSync("handles.json", "utf8"));
var map = new Map(Object.entries(obj));
var temp = new Map();

function save(){
  var jsonObj = Object.fromEntries(map);
  console.log(jsonObj);
  var jsonContent = JSON.stringify(jsonObj);
  fs.writeFileSync("handles.json", jsonContent, "utf8", function(err) {
    if (err) {
      console.log("An errr occured while writing JSON jsonObj to File.");
      return console.log(err);
    }
    console.log("saved");
  });
}


module.exports = {
  duel: function(bot, msg){
    var args = msg.text.split(" ");
    switch(args[1]){
      case 'cfrating':
        if(map.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'Register your handle first!');
          return;
        }
        var request = require('request');
        request('http://codeforces.com/api/user.rating?handle=' + map.get(msg.from.username), function (error, response, body) {
          if (!error && response.statusCode == 200) {
           var rating = JSON.parse(body);
           console.log(rating.result[0]);
           bot.sendMessage(msg.chat.id, rating.result[rating.result.length - 1].newRating.toString());
          }
        });
      break;
      case 'regis':
        console.log('register');
        if(map.has(msg.from.username)){
          bot.sendMessage(msg.chat.id, 'you are registered!');
          break;
        }
        var args = msg.text.split(" ");
        if(args.length != 3){
          bot.sendMessage(msg.chat.id, 'that\'s not a valid thing');
          break;
        }
        temp.set(msg.from.username, args[2])
        bot.sendMessage(msg.chat.id, 'send a compile error to any of the problems here https://codeforces.com/contest/54 to verify it\'s you');
      break;
      case 'doneregis':
        if(temp.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'you are not registering');
          break;
        }
        var request = require('request');
        request('http://codeforces.com/api/user.status?handle=' + temp.get(msg.from.username) + '&from=1&count=1', function (error, response, body) {
          if (!error && response.statusCode == 200) {
           var submission = JSON.parse(body);
           console.log(submission.result[0]);
           if(submission.result[0].contestId != 54 || submission.result[0].verdict != 'COMPILATION_ERROR'){
            bot.sendMessage(msg.chat.id, 'send a compile error to any of the problems here https://codeforces.com/contest/54 to verify it\'s you');
            return;
           }
           map.set(msg.from.username, temp.get(msg.from.username));
           temp.delete(msg.from.username);
           save();
           bot.sendMessage(msg.chat.id, 'handle set!');
          }
        });
      break;
    }
  }
}
