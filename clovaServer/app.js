const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');

const clovaSkillHandler = clova.Client
    .configureSkill()

    // return response when first request
    .onLaunchRequest(responseHelper => {
      responseHelper.setSimpleSpeech({
        lang: 'ja',
        type: 'PlainText',
        value: 'こんばんわ、CRemを起動しました。',
      });
    })

    // get request and return response
    .onIntentRequest(async responseHelper => {
      const intent = responseHelper.getIntentName();

      if(intent === 'temporarySearch'){
        const slots = responseHelper.getSlots();
        const userID = responseHelper.getUser();
        console.log(slots);
        console.log(userID);

         var speech = {
          lang: 'ja',
          type: 'PlainText',
          value: `まだ登録されていないです。`
        }
        if(slots.temp === '日本語'){
          speech.value = `${slots.temp}は教えられません。`;
        }
      }
      responseHelper.setSimpleSpeech(speech);
      responseHelper.setSimpleSpeech(speech, true);
      console.log(intent); // (debug) show intent
    })

    // finish response
    .onSessionEndedRequest(responseHelper => {
      console.log("temp");
        var speech = {
            lang: 'ja',
            type: 'PlainText',
            value: `これで、終了です。お疲れ様でした。`
        }
        responseHelper.setSimpleSpeech(speech);
        responseHelper.setSimpleSpeech(speech, true);
    })
    .handle();


const app = new express();
const port = process.env.PORT || 3000;

// set application id
const clovaMiddleware = clova.Middleware({applicationId: 'com.jellyfish.CRem'});
app.post('/clova', clovaMiddleware, clovaSkillHandler);

app.listen(port, () => console.log(`Server running on ${port}`));