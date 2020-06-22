const fs = require("fs");
var crypto = require('crypto');
var obj = JSON.parse(fs.readFileSync("handles.json", "utf8"));
var map = new Map(Object.entries(obj));
obj = JSON.parse(fs.readFileSync("points.json", "utf8"));
var points = new Map(Object.entries(obj));
obj = JSON.parse(fs.readFileSync("problems.json", "utf8"));
var problem = new Map(Object.entries(obj));
obj = JSON.parse(fs.readFileSync("ongoing.json", "utf8"));
var ongoing = new Map(Object.entries(obj));
obj = JSON.parse(fs.readFileSync("rating.json", "utf8"));
var rating = new Map(Object.entries(obj));
var challenge = new Map();
var regisTemp = new Map();
var auth = require('./auth.json');
var plotly = require('plotly')('juancarlovieri', auth.plotly);

function download(uri, filename, callback){
  const request = require('request');
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

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
  jsonObj = Object.fromEntries(points);
  console.log(jsonObj);
  var jsonContent = JSON.stringify(jsonObj);
  fs.writeFileSync("points.json", jsonContent, "utf8", function(err) {
    if (err) {
      console.log("An errr occured while writing JSON jsonObj to File.");
      return console.log(err);
    }
    console.log("saved");
  });
  jsonObj = Object.fromEntries(problem);
  console.log(jsonObj);
  var jsonContent = JSON.stringify(jsonObj);
  fs.writeFileSync("problems.json", jsonContent, "utf8", function(err) {
    if (err) {
      console.log("An errr occured while writing JSON jsonObj to File.");
      return console.log(err);
    }
    console.log("saved");
  });
  jsonObj = Object.fromEntries(ongoing);
  console.log(jsonObj);
  var jsonContent = JSON.stringify(jsonObj);
  fs.writeFileSync("ongoing.json", jsonContent, "utf8", function(err) {
    if (err) {
      console.log("An errr occured while writing JSON jsonObj to File.");
      return console.log(err);
    }
    console.log("saved");
  });
  jsonObj = Object.fromEntries(rating);
  console.log(jsonObj);
  var jsonContent = JSON.stringify(jsonObj);
  fs.writeFileSync("rating.json", jsonContent, "utf8", function(err) {
    if (err) {
      console.log("An errr occured while writing JSON jsonObj to File.");
      return console.log(err);
    }
    console.log("saved");
  });
}

function win(winner, looser){
  var ratingW = [];
  if(rating.has(winner) == false){
    ratingW = [1500];
  } else{
    ratingW = rating.get(winner);
  }
  var ratingL = 0;
  if(rating.has(looser) == false){
    ratingL = 1500;
  } else{
    ratingL = rating.get(looser);
  }
  ratingW[ratingW.length] = ratingW[ratingW.length - 1] + 50;
  ratingL[ratingL.length] = ratingL[ratingL.length - 1] - 50;
  rating.set(winner, ratingW);
  rating.set(looser, ratingL);
  save();
}

function printratingHist(msg, bot){
  var args = msg.text.split(' ');
  if(args.length != 3){
    bot.sendMessage(msg.chat.id, 'that\'s not a valid thing');
    return;
  }
  if(map.has(args[2]) == false){
    bot.sendMessage(msg.chat.id, args[2] + ' haven\'t registered his/her handle');
    return;
  }
  if(rating.has(args[2]) == false){
    bot.sendMessage(msg.chat.id, args[2] + ' have never participated in a duel!');
    return;
  }
  var hasil = rating.get(args[2])[0].toString();
  for(var i = 1; i < rating.get(args[2]).length; i++){
    hasil += ' - ' + rating.get(args[2])[i].toString;
  }
  bot.sendMessage(msg.chat.id, 'rating history for ' + args[2] + ': ' + hasil);
}

function printRatingGraph(msg, bot){
  var args = msg.text.split(' ');
  var names = "rating graph for: ";
  var data = [];
  for(var i = 2; i < args.length; i++){
    names += ' ' + args[i];
    if(map.has(args[i]) == false){
      bot.sendMessage(msg.chat.id, args[i] + ' haven\'t registered his/her handle');
      return;
    }
    if(rating.has(args[i]) == false){
      bot.sendMessage(msg.chat.id, args[i] + ' have never participated in a duel!');
      return;
    }
    var temp = {
      x: [],
      y: [],
      name: args[i],
      type: "scatter"
    };
    temp.y = rating.get(args[i]);
    for(var j = 0; j < temp.y.length; j++){
      temp.x[temp.x.length] = j + 1;
    }
    console.log(temp);
    data[data.length] = temp;
  }
  console.log(data);
  var graphOptions = {filename: 'umum', fileopt: "overwrite"};
  plotly.plot(data, graphOptions, function (err, mesg) {
    console.log(mesg);
    var request = require('request');
    download(mesg.url + '.jpeg', 'display.png', function(){
      bot.sendPhoto(msg.chat.id, 'display.png', { caption: names } ) 
    });
  });
}

function takeRating(user){
  var request = require('sync-request');
  var ratings = request('GET', 'http://codeforces.com/api/user.rating?handle=' + user);
  var rating = JSON.parse(ratings.getBody());
  // console.log(rating.result[0]);
  return rating.result[rating.result.length - 1].newRating.toString();
}

function getDuelRating(user){
  if(map.has(user) == false){
    return user + ' haven\'t registered his / her handle';
  }
  else{
    if(rating.has(user) == false){
      return user + ' have never participated in a duel';
    } else{
      return rating.get(user);
    }
  }
  return 
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
        bot.sendMessage(msg.chat.id, takeRating(map.get(msg.from.username)));
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
        regisTemp.set(msg.from.username, args[2]);
        bot.sendMessage(msg.chat.id, 'submit ' + crypto.createHash('sha256').update(msg.from.username).digest('base64') + '  to any problem');
      break;
      case 'probdone':
        if(problem.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'you have no active problem!');
          return;
        }
        var request = require('request');
        request('http://codeforces.com/api/user.status?handle=' + map.get(msg.from.username) + '&from=1&count=1', function (error, response, body) {
          var submission = JSON.parse(body).result[0];
          console.log(submission);
          if(submission.verdict == 'OK' && submission.problem.contestId == problem.get(msg.from.username).contestId && submission.problem.index == problem.get(msg.from.username).index){
            var res = [];
            if(points.has(msg.from.username)){
              res = points.get(msg.from.username);
              res[res.length] = res[res.length - 1] + 10 + (((problem.get(msg.from.username).rating - 800) / (100))) * ((problem.get(msg.from.username).rating - 800) / (100));
            } else{
              res[0] = 10 + (((problem.get(msg.from.username).rating - 800) / (100))) * ((problem.get(msg.from.username).rating - 800) / (100));
            }
            points.set(msg.from.username, res);
            save();
            bot.sendMessage(msg.chat.id, '@' + msg.from.username + ' gained ' + 10 + (((problem.get(msg.from.username).rating - 800) / (100))) * ((problem.get(msg.from.username).rating - 800) / (100)) + ' points');
            problem.delete(msg.from.username);
            return;
          } else{
            bot.sendMessage(msg.chat.id, 'solve this problem, ' + msg.from.username + ': https://codeforces.com/contest/' + problem.get(msg.from.username).contestId + '/problem/' + problem.get(msg.from.username).index);
          }
        });        
      break;
      case 'rating':
        var args = msg.text.split(' ');
        if(args.length < 3){
          bot.sendMessage(msg.chat.id, 'that\'s not a valid thing');
          break;
        }
        bot.sendMessage(msg.chat.id, getDuelRating(args[2]));
      break;
      case 'ratinggraph':
        printRatingGraph(msg, bot);
      break;
      case 'ratinghist':
        printratingHist(msg, bot);
      break;
      break;
      case 'pointgraph':
        var data = [];
        var names = 'graph for';
        for(var i = 2; i < args.length; i++){
          names += ' ' + args[i];
          if(map.has(args[i]) == false){
            bot.sendMessage(msg.chat.id, args[i] + ' haven\'t registered his/her handle');
            return;
          }
          var temp = {
            x: [],
            y: [],
            name: args[i],
            type: "scatter"
          };
          if(points.has(args[i]) == false){
            temp.y = [0];
          } else{
            temp.y = points.get(args[i]);
          }
          for(var j = 0; j < temp.y.length; j++){
            temp.x[temp.x.length] = j + 1;
          }
          console.log(temp);
          data[data.length] = temp;
        }
        console.log(data);
        var graphOptions = {filename: 'umum', fileopt: "overwrite"};
        plotly.plot(data, graphOptions, function (err, mesg) {
          console.log(mesg);
          var request = require('request');
          download(mesg.url + '.jpeg', 'display.png', function(){
            bot.sendPhoto(msg.chat.id, 'display.png', { caption: names } ) 
          });
        });
      break;
      case 'pointhist':
        var args = msg.text.split(' ');
        if(args.length == 3){
          if(map.has(args[2]) == false){
            bot.sendMessage(msg.chat.id, args[2] + ' have\'nt register his/her handle');
          } else{
            if(points.has(args[2]) == false){
              bot.sendMessage(msg.chat.id, "0");
            } else{
              var hasil = points.get(args[2])[0].toString();
              for(var i = 1; i < points.get(args[2]).length; i++)hasil += " - " + points.get(args[2])[i].toString();
              bot.sendMessage(msg.chat.id, hasil);
            }
          }
          break;          
        }
        if(map.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'register your handle first!');
          break;
        }
        if(points.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, "0");
        } else{
          var hasil = points.get(msg.from.username)[0].toString();
          for(var i = 1; i < points.get(msg.from.username).length; i++)hasil += " - " + points.get(msg.from.username)[i].toString();
          bot.sendMessage(msg.chat.id, hasil);
        }
      break;
      case 'point':
        var args = msg.text.split(' ');
        if(args.length == 3){
          if(map.has(args[2]) == false){
            bot.sendMessage(msg.chat.id, args[2] + ' have\'nt register his/her handle');
          } else{
            if(points.has(args[2]) == false){
              bot.sendMessage(msg.chat.id, "0");
            } else{
              bot.sendMessage(msg.chat.id, points.get(args[2])[points.get(args[2]).length - 1].toString());
            }
          }
          break;          
        }
        if(map.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'register your handle first!');
          break;
        }
        if(points.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, "0");
        } else{
          bot.sendMessage(msg.chat.id, points.get(msg.from.username)[points.get(msg.from.username).length - 1].toString());
        }
      break;
      case 'complete':
        if(ongoing.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'you have no ongoing duel!');
          break;
        }
        var request = require('request');
        request('http://codeforces.com/api/user.status?handle=' + map.get(msg.from.username) + '&from=1&count=1', function (error, response, body) {
          var submission = JSON.parse(body).result[0];
          console.log(submission);
          if(submission.verdict == 'OK' && submission.problem.contestId == ongoing.get(msg.from.username)[1].contestId && submission.problem.index == ongoing.get(msg.from.username)[1].index){
            win(msg.from.username, ongoing.get(msg.from.username)[0]);
            bot.sendMessage(msg.chat.id, msg.from.username + ' has beaten ' + ongoing.get(msg.from.username)[0] + ' in a ' + ongoing.get(msg.from.username)[1].rating + ' duel');
            ongoing.delete(ongoing.get(msg.from.username)[0]);
            ongoing.delete(msg.from.username);
            save();
          } else{
            bot.sendMessage(msg.chat.id, 'solve this problem, ' + msg.from.username + ': https://codeforces.com/contest/' + ongoing.get(msg.from.username)[1].contestId + '/problem/' +ongoing.get(msg.from.username)[1].index);
          }
        });
      break;
      case 'accept':
        if(challenge.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'no one is challenging you');
          break;
        }
        var args = msg.text.split(' ');
        var rating = challenge.get(msg.from.username)[1];
        var request = require('sync-request');
        var list = request('GET', 'http://codeforces.com/api/problemset.problems');
        var problems = JSON.parse(list.getBody()).result.problems;
        var indx = -1;
        var counter = 0;
        problems = shuffleArray(problems);
        for(var temp = 0; temp < problems.length; temp++){
          if(problems[temp].rating != rating){
            continue;
          }
          var request2 = require('sync-request');
          var submissions = request2('GET', 'http://codeforces.com/api/contest.status?contestId=' + problems[temp].contestId + '&from=1&count=1000000&handle=' + map.get(msg.from.username));
          var submission = JSON.parse(submissions.getBody()).result;
          var can = 1;  
          for(var i = 0; i < submission.length; i++){
            if(submission[i].problem.index == problems[temp].index){
              can = 0;
              break;
            }
          }
          submissions = request2('GET', 'http://codeforces.com/api/contest.status?contestId=' + problems[temp].contestId + '&from=1&count=1000000&handle=' + map.get(challenge.get(msg.from.username)[0]));
          submission = JSON.parse(submissions.getBody()).result;
          for(var i = 0; i < submission.length; i++){
            if(submission[i].problem.index == problems[temp].index){
              can = 0;
              break;
            }
          }
          if(can == 1){
            indx = temp;
            break;
          }
        }
        if(indx == -1){
          bot.sendMessage(msg.chat.id, 'internal error, contact developer');
          console.log('problem index not found');
          return;
        }
        var tempo = [challenge.get(msg.from.username)[0], problems[indx]];
        ongoing.set(msg.from.username, tempo);
        tempo = [msg.from.username, problems[indx]];
        ongoing.set(challenge.get(msg.from.username)[0], tempo);
        console.log(indx);
        save();
        bot.sendMessage(msg.chat.id, 'problem for @' + msg.from.username + 'and @' + challenge.get(msg.from.username)[0] + ': https://codeforces.com/contest/' + problems[indx].contestId + '/problem/' + problems[indx].index);
        challenge.delete(msg.from.username);
      break;
      case 'challenge':
        var args = msg.text.split(' ');
        if(args.length != 4){
          bot.sendMessage(msg.chat.id, 'that\'s not a valid thing');
          break;
        }
        if(args[2] == msg.from.username){
          bot.sendMessage(msg.chat.id, 'you can\'t duel yourselves');
          break;
        }
        if(map.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'register your handle first!');
          break;
        }
        if(map.has(args[2]) == false){
          bot.sendMessage(msg.chat.id, args[2] + ' haven\'t register his/her handle');
          break;
        }
        if(isNaN(args[3])){
          bot.sendMessage(msg.chat.id, 'that\'s not a valid thing');
          break;
        }
        var temp = [msg.from.username, parseInt(args[3])];
        challenge.set(args[2], temp);
        bot.sendMessage(msg.chat.id, "@" + args[2] + ", " + msg.from.username + " is challenging you on a " + parseInt(args[3]) + ' duel');
      break;
      case 'prob':
        if(map.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'register your handle first!');
          break;
        }
        var args = msg.text.split(' ');
        var rating = parseInt(args[2]);
        if(args[2] == "myrating"){
          console.log(takeRating(map.get(msg.from.username)));
          rating = Math.round(takeRating(map.get(msg.from.username)) / 100) * 100;
        }
        rating = Math.round(rating / 100) * 100;
        if(args.length != 3 || isNaN(rating)){
          bot.sendMessage(msg.chat.id, 'that\'s not a valid thing');
          break;
        }
        console.log('new prob');
        var request = require('sync-request');
        var list = request('GET', 'http://codeforces.com/api/problemset.problems');
        var problems = JSON.parse(list.getBody()).result.problems;
        var indx = -1;
        var counter = 0;
        problems = shuffleArray(problems);
        for(var temp = 0; temp < problems.length; temp++){
          if(problems[temp].rating != rating){
            continue;
          }
          var request2 = require('sync-request');
          var submissions = request2('GET', 'http://codeforces.com/api/contest.status?contestId=' + problems[temp].contestId + '&from=1&count=1000000&handle=' + map.get(msg.from.username));
          var submission = JSON.parse(submissions.getBody()).result;
          var can = 1;  
          for(var i = 0; i < submission.length; i++){
            if(submission[i].problem.index == problems[temp].index){
              can = 0;
              break;
            }
          }
          if(can == 1){
            indx = temp;
            break;
          }
        }
        if(indx == -1){
          bot.sendMessage(msg.chat.id, 'internal error, contact developer');
          console.log('problem index not found');
          return;
        }
        console.log(indx);
        problem.set(msg.from.username, problems[indx]);
        save();
        bot.sendMessage(msg.chat.id, 'problem for @' + msg.from.username + ': https://codeforces.com/contest/' + problems[indx].contestId + '/problem/' + problems[indx].index);
      break;
      case 'regisdone':
        if(regisTemp.has(msg.from.username) == false){
          bot.sendMessage(msg.chat.id, 'you are not registering');
          break;
        }
        var request = require('request');
        request('http://codeforces.com/api/user.status?handle=' + regisTemp.get(msg.from.username) + '&from=1&count=1', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var submission = JSON.parse(body);
            var request2 = require('request'); 
            request2('http://codeforces.com/contest/' + submission.result[0].contestId + '/submission/' + submission.result[0].id, function(error, response, body){
              var indx = body.indexOf(crypto.createHash('sha256').update(msg.from.username).digest('base64'));
              if(indx < 0 || Date.now() - 3600000 > submission.result[0].creationTimeSeconds * 1000){
                bot.sendMessage(msg.chat.id, 'submit ' + crypto.createHash('sha256').update(msg.from.username).digest('base64') + '  to any problem');
                return;
              } else{
                map.set(msg.from.username, regisTemp.get(msg.from.username));
                regisTemp.delete(msg.from.username);
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
