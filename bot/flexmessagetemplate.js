var Template = {
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

module.exports = Template;