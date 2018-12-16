'use strict';

const fs = require("fs");
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

app.get("/list/:userId", function (req, res) {
    var userId = req.params.userId;
    console.log(userId);
    var questionList = JSON.parse(fs.readFileSync("./testlist.json"));

    var filtered_question = questionList.data.filter(function (item, index) {
        if (item.userId == userId) {
            return true;
        }
    });

    var response = {
        questions: []
    };

    filtered_question.forEach(function (element) {
        response.questions.push({
            question: element.question,
            answer: element.answer
        });
    });

    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(response);

});

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

var users = {
    users: [
        {
            userId: "userId",
            state: 0,
            making: {
                userId: "userId",
                question: "問題",
                answer: "答え"
            }
        }

    ]
}

const client = new line.Client(config);

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    var filteredUser = users.users.filter(function (item, index) {
        if (item.userId == event.source.userId) return true;
    });

    var user = null;

    if (filteredUser.length > 0) {
        user = filteredUser[0];
    } else {
        user = {
            userId: event.source.userId,
            state: 0,
            making: {
                userId: "userId",
                question: "問題",
                answer: "答え"
            }
        };
    }
    // 返答に用いるmessage
    var message = {
        type: 'text',
        text: "message"
    };

    // !!!!!!
    // この実装だとNORMAL以外のstateのとき他のユーザがアクセスすると詰み
    // !!!!!!
    switch (user.state) {
        case BOT_STATE.NORMAL:
            //通常状態の動作の記述
            message = normal_behaviour(event, user);
            break;

        case BOT_STATE.QUESTION_WAITING:
            //問題入力待ちの動作の記述
            message = question_waiting_behaviour(event, user);
            break;

        case BOT_STATE.ANSWER_WAITING:
            //回答入力待ちの動作の記述
            message = answer_waiting_behaviour(event, user);
            break;

        default:
            break;
    }

    if (filteredUser > 0) {
        users.users.forEach(function (element) {
            if (element.userId == user.userId) {
                element.state = user.state;
                element.making = user.making;
            }
        });
    }
    else {
        users.users.push(user);
    }

    console.log(message);
    //console.log(JSON.stringify(users));

    return client.replyMessage(event.replyToken, message);
}


function normal_behaviour(event, user) {
    // 問題追加トリガーが送られたとき問題待ちに移行
    if (event.message.text == "問題を追加") {
        user.state = BOT_STATE.QUESTION_WAITING;
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
            var listTemplate = {
                "type": "bubble",
                "styles": {
                    "footer": {
                        "separator": true
                    }
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "問題リスト",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md"
                        },
                        {
                            "type": "separator",
                            "margin": "xl"
                        },

                        // [2] 問題，回答をcontentsに格納する
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "xxl",
                            "spacing": "sm",
                            "contents": [

                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "xxl"
                        },

                        // [4]  contents[1].text = 'userId'
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "md",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "USER ID",
                                    "size": "xs",
                                    "color": "#aaaaaa",
                                    "flex": 0
                                },
                                // [1]
                                {
                                    "type": "text",
                                    "text": "#743289384279",
                                    "color": "#aaaaaa",
                                    "size": "xs",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                }
            }

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
        else {
            var message = {
                "type": "text",
                "text": "問題リストが空です"
            };

            return message;
        }
    }

    if (event.message.text == "問題リストを消去") {
        // リスト消去処理
        test_accessor.clearList(event.source.userId);
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

function question_waiting_behaviour(event, user) {
    // <-------- 問題文を追加する処理 

    user.making.question = event.message.text;

    // 問題文を追加する処理 --------->

    user.state = BOT_STATE.ANSWER_WAITING;
    var message = {
        type: "text",
        text: "回答を入力してください"
    };
    return message;
}

function answer_waiting_behaviour(event, user) {
    // <---------- 回答を追加する処理

    user.making.answer = event.message.text;
    user.making.userId = event.source.userId;

    // テストのリストに格納
    test_accessor.addData(user.making);

    // 回答を追加する処理 ---------->

    var response
        = "(" + user.making.question
        + "," + user.making.answer
        + ") で問題を登録しました";

    user.making.question = "";
    user.making.answer = "";

    user.state = BOT_STATE.NORMAL;
    var message = {
        type: "text",
        text: response
    };
    return message;
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);