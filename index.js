'use strict'

let express = require('express')
let bodyParser = require('body-parser')

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

let randomNumber = Math.floor((Math.random() * 101));
console.log('random number: ' + randomNumber);
let blockGuess = false;

const initialPrompt = '请猜一个0到100以内的数字。';

app.post('/', function (req, res) {
  console.log(JSON.stringify(req.body));

  let requestBody = req.body;
  let intentName = requestBody.intentName;
  let userUtterance = requestBody.utterance;
  console.log('user utterance: ' + userUtterance);

  let replyMessage = '';
  let resultType = 'RESULT';
  switch (intentName) {
    case 'guess_number':
      // TODO(qyp): Block this intent if user has guessed number
      // and has not started a new round.
      if (blockGuess) {
        replyMessage = '您刚才已经猜对了。您还想继续玩吗？';
        resultType = 'CONFIRM';
        break;
      }
      let guessedNumber = requestBody.slotEntities.find(function (entity) {
        return entity.intentParameterName === 'guessed_number';
      }).standardValue;
      console.log('guessed number: ' + guessedNumber);
      if (guessedNumber < 0 || guessedNumber > 100) {
        replyMessage = initialPrompt;
        resultType = 'ASK_INF';
      } else if (guessedNumber > randomNumber) {
        replyMessage = '您猜的数字太大了。';
        resultType = 'ASK_INF';
      } else if (guessedNumber < randomNumber) {
        replyMessage = '您猜的数字太小了。';
        resultType = 'ASK_INF';
      } else {
        blockGuess = true;
        replyMessage = '您猜对了！您还想继续玩吗？';
        resultType = 'CONFIRM';
      }
      // replyMessage = '你猜了：' + guessedNumber;
      break;
    case 'yes_or_no':
      let answer = requestBody.slotEntities.find(function (entity) {
        return entity.intentParameterName === 'answer';
      }).standardValue === 'yes';
      if (answer) {
        randomNumber = Math.floor((Math.random() * 101));
        console.log('random number: ' + randomNumber);
        blockGuess = false;
        replyMessage = initialPrompt;
        resultType = 'ASK_INF';
      } else {
        // TODO(qyp): Make conversation end?
        replyMessage = '再见！';
        resultType = 'RESULT';
      }
      break;
    case 'default_fallback':
      replyMessage = '对不起，我暂时无法理解您的意思。';
      resultType = 'RESULT';
      break;
    default:
      replyMessage = '对不起，我暂时无法处理这个意图。';
      resultType = 'RESULT';
      break;
  }

  let echoResponse = `
{
    "returnCode": "0",
    "returnErrorSolution": "",
    "returnMessage": "",
    "returnValue": {
        "reply": "${replyMessage}",
        "resultType": "${resultType}",
        "executeCode": "SUCCESS",
        "msgInfo": ""
    }
}
    `;

  res.append('Content-Type', 'application/json');
  res.status(200).send(echoResponse);
});

let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});

