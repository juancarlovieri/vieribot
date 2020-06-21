const fs = require("fs");
var crypto = require('crypto');
var obj = JSON.parse(fs.readFileSync("handles.json", "utf8"));
var map = new Map(Object.entries(obj));
var temp = new Map();
var time = new Map();

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
          bot.sendMessage(msg.chat.id, 'you are reregistering!');
        }
        var args = msg.text.split(" ");
        if(args.length != 3){
          bot.sendMessage(msg.chat.id, 'that\'s not a valid thing');
          break;
        }
        temp.set(msg.from.username, args[2]);
        bot.sendMessage(msg.chat.id, 'submit ' + crypto.createHash('sha256').update(msg.from.username).digest('base64') + '  to any problem');
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
            var request2 = require('request'); 
            request2('http://codeforces.com/contest/' + submission.result[0].contestId + '/submission/' + submission.result[0].id, function(error, response, body){
              var indx = body.indexOf(crypto.createHash('sha256').update(msg.from.username).digest('base64'));
              if(indx < 0 || Date.now() - 3600000 > submission.result[0].creationTimeSeconds * 1000){
                bot.sendMessage(msg.chat.id, 'submit ' + crypto.createHash('sha256').update(msg.from.username).digest('base64') + '  to any problem');
                return;
              } else{
                map.set(msg.from.username, temp.get(msg.from.username));
                temp.delete(msg.from.username);
                save();
                bot.sendMessage(msg.chat.id, 'registered!');
              }
            });
          }
        });
      break;
    }
  }
}
