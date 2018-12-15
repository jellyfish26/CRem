'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: 'df3b1eee2b00e9e754a7e6506d106ea3',
    channelAccessToken: '8dA4Vk455IOhiIVEKTKSJnhiBVURCogrbqs7WFMuMMFsqfxQe0abm+DBKysyIae0gviSqEPBf7N6iSmhAR9PkbgQjS656bVe7GJNzWxr2wNwl2DyjzcIAC+fopa8Q6IS7oP+fW63Xolloc4qKt1RgAdB04t89/1O/w1cDnyilFU='
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text //実際に返信の言葉を入れる箇所
  });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);