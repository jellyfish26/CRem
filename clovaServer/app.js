const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const webClient = require("request");
var postQuestionNumber = 0;
var questionAnswerSet;
var getQuestionLength = 0;

const clovaSkillHandler = clova.Client
    .configureSkill()
    // return response when first request
    .onLaunchRequest(responseHelper => {
      responseHelper.setSimpleSpeech({
        lang: 'ja',
        type: 'PlainText',
        value: 'こんばんわ、CRemを起動しました。',
      });
      console.log(responseHelper.getUser().userId);

      webClient.get({
          url:`https://fa60b617.ngrok.io/list/${responseHelper.getUser().userId}`
      }, function (error, response, body) {
          questionAnswerSet = JSON.parse(body).questions;
          getQuestionLength = questionAnswerSet.length;
          console.log(questionAnswerSet);
          if (getQuestionLength != 0) {
              console.log(questionAnswerSet[postQuestionNumber].question);
          }
      })
    })

    // get request and return response
    .onIntentRequest(async responseHelper => {
      const intent = responseHelper.getIntentName();
      var continuousRequest = false;
      console.log(intent); // (debug) show intent

        var speakContents = {
            lang: 'ja',
            type: 'PlainText',
            value: `none    `
        };

        if (getQuestionLength == 0) {
            speakContents.value = "問題が登録されていません。問題を登録してからアプリを起動してください。"
        } else {
            if (intent === 'requestProblem') {
                const slots = responseHelper.getSlots();
                console.log(slots);
                speakContents.value = questionAnswerSet[postQuestionNumber].question;

                if (continuousRequest) {
                    // value change
                    speakContents.value = 'すでに問題は出題されています。'
                } else {
                    continuousRequest = true;
                }
            } else if (intent === 'nextProblem') {
                const slots = responseHelper.getSlots();
                console.log(slots);
                continuousRequest = false;

                speakContents.value = `答えは${questionAnswerSet[postQuestionNumber].answer}です。`
                ++postQuestionNumber;
            } else if(intent === 'temporarySearch') {
                const slots = responseHelper.getSlots();
                const userID = responseHelper.getUser();
                console.log(slots);
                console.log(userID);

                var speech = {
                    lang: 'ja',
                    type: 'PlainText',
                    value: `よーわからんかったわ、もう一回ゆって`
                };
                if(slots.temp === '日本語'){
                    speech.value = `${slots.temp}は教えられません。`;
                }
            } else {
                speakContents.value = '聞き取れませんでした。'
            }
        }
        responseHelper.setSimpleSpeech(speakContents);
        responseHelper.setSimpleSpeech(speakContents, true);
    })

    // finish response
    .onSessionEndedRequest(responseHelper => {
        postQuestionNumber = 0;
         let speech = {
            lang: 'ja',
            type: 'PlainText',
            value: `これで、終了です。お疲れ様でした。`
        };
        responseHelper.setSimpleSpeech(speech);
        responseHelper.setSimpleSpeech(speech, true);
        responseHelper.onspeechend
    }).handle();


const app = new express();
const port = process.env.PORT || 3000;

// set application id
const clovaMiddleware = clova.Middleware({applicationId: 'com.kosen.crem'});
app.post('/', clovaMiddleware, clovaSkillHandler);

app.listen(port, () => console.log(`Server running on ${port}`));