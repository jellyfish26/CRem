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
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});


// ------ここまでWebhook処理----------


// -------ここからLINE処理------------

// 名称は後ですり合わせて変更する
function question() {
    this.userId = "";
    this.question = "";
    this.answer = "";
}

// Botの状態の列挙
const BOT_STATE = {
    NORMAL: 0,
    QUESTION_WAITING: 1,
    ANSWER_WAITING: 2
};

// Botの状態
var state = BOT_STATE.NORMAL;

// 作成中のquestion
var making_question = new question();

const client = new line.Client(config);

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    var replyText = "";

    switch (state) {
        case BOT_STATE.NORMAL:
            //通常状態の動作の記述
            replyText = normal_behaviour(event);
            break;

        case BOT_STATE.QUESTION_WAITING:
            //問題入力待ちの動作の記述
            replyText = question_waiting_behaviour(event);
            break;

        case BOT_STATE.ANSWER_WAITING:
            //回答入力待ちの動作の記述
            replyText = answer_waiting_behaviour(event);
            break;

        default:
            replyText = "Error : 定義していないState";
            break;
    }

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText //実際に返信の言葉を入れる箇所
    });
}


function normal_behaviour(event) {
    if (event.message.text == "問題を追加") {
        state = BOT_STATE.QUESTION_WAITING;
        return "問題文を入力してください";
    }

    if (event.message.text == "問題リストを表示") {
        var question_list = "問題リスト";
        // 問題リストを取得，いい感じに並べる処理
        return question_list;
    }

    if (event.message.text == "問題リストを消去") {
        // リスト消去処理
        return "問題リストを消去しました";
    }

    if (event.message.text == "説明文") {
        var app_description = "説明文";
        return app_description;
    }


    // 設定した文以外の文が送られてきたときの処理
    var other_response = "ちがう文だよ";
    return other_response;

}

function question_waiting_behaviour(event) {
    // <-------- 問題文を追加する処理 

    making_question.question = event.message.text;

    // 問題文を追加する処理 --------->

    state = BOT_STATE.ANSWER_WAITING;
    return "回答を入力してください";
}

function answer_waiting_behaviour(event) {
    // <---------- 回答を追加する処理

    making_question.answer = event.message.text;
    making_question.userId = event.source.userId;

    // 回答を追加する処理 ---------->

    var response
        = "(" + making_question.question
        + "," + making_question.answer 
        + ") で問題を登録しました";
    
    making_question.question = "";
    making_question.answer = "";

    state = BOT_STATE.NORMAL;
    return response;
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);