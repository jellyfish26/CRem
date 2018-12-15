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

const test_accessor = require("./testlistaccessor");

// 名称調整済み
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

    // 返答に用いるmessage
    var message = {
        type: 'text',
        text: "message"
    };

    switch (state) {
        case BOT_STATE.NORMAL:
            //通常状態の動作の記述
            message = normal_behaviour(event);
            break;

        case BOT_STATE.QUESTION_WAITING:
            //問題入力待ちの動作の記述
            message = question_waiting_behaviour(event);
            break;

        case BOT_STATE.ANSWER_WAITING:
            //回答入力待ちの動作の記述
            message = answer_waiting_behaviour(event);
            break;

        default:
            break;
    }

    console.log(message);

    return client.replyMessage(event.replyToken, message);
}


function normal_behaviour(event) {
    // 問題追加トリガーが送られたとき問題待ちに移行
    if (event.message.text == "問題を追加") {
        state = BOT_STATE.QUESTION_WAITING;
        var message = {
            type: "text",
            text: "問題文を入力してください"
        };
        return message;
    }

    if (event.message.text == "問題リストを表示") {
        var listObj = test_accessor.getList(event.source.userId);

        // リストの中身が存在するときはFlex Messageで返答を返す
        if (listObj.length > 0) {
            var listTemplate = require('./flexmessagetemplate');

            listObj.forEach(function (element) {
                var list_part = {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                        {
                            "type": "text",
                            "text": element.question,
                            "size": "sm",
                            "color": "#555555",
                            "flex": 0
                        },
                        {
                            "type": "text",
                            "text": element.answer,
                            "size": "sm",
                            "color": "#111111",
                            "align": "end"
                        }
                    ]
                };

                // 問題を入れるエリアに格納 -- 詳細はflexmessagetemplate.jsを参照
                listTemplate.body.contents[2].contents.push(list_part);

            });

            // userIdを入れるエリアに格納 -- 詳細はflexmessagetemplate.jsを参照
            listTemplate.body.contents[4].contents[1].text = event.source.userId;

            // flex使うときの標準形
            var message = {
                "type": "flex",
                "altText": "#",
                "contents": {}
            }

            message.contents = listTemplate;

            return message;
        }
        else
        {
            var message = {
                "type": "text",
                "text": "問題リストが空です"
            };

            return message;
        }
    }

    if (event.message.text == "問題リストを消去") {
        // リスト消去処理
        test_accessor.clearList();
        var message = {
            type: "text",
            text: "問題リストを消去しました"
        };
        return message;
    }

    if (event.message.text == "説明文") {
        var app_description = "説明文";
        var message = {
            type: "text",
            text: app_description
        };
        return message;
    }


    // 設定した文以外の文が送られてきたときの処理
    var message = {
        type: "text",
        text: "未対応のメッセージです"
    };
    return message;

}

function question_waiting_behaviour(event) {
    // <-------- 問題文を追加する処理 

    making_question.question = event.message.text;

    // 問題文を追加する処理 --------->

    state = BOT_STATE.ANSWER_WAITING;
    var message = {
        type: "text",
        text: "回答を入力してください"
    };
    return message;
}

function answer_waiting_behaviour(event) {
    // <---------- 回答を追加する処理

    making_question.answer = event.message.text;
    making_question.userId = event.source.userId;

    // テストのリストに格納
    test_accessor.addData(making_question);

    // 回答を追加する処理 ---------->

    var response
        = "(" + making_question.question
        + "," + making_question.answer
        + ") で問題を登録しました";

    making_question.question = "";
    making_question.answer = "";

    state = BOT_STATE.NORMAL;
    var message = {
        type: "text",
        text: response
    };
    return message;
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);