window.onload = function () {
  liff.init(function(data) {
    const userId = data.context.userId;
    initializeApp(data);
  });
};
function initializeApp(data) {
  liff.sendMessages([
    {
      type:'text',
      text:'問題をまとめて追加'
    }
  ])
  .then(() => {
    console.log('message sent');
  })
  .catch((err) => {
    console.log('error', err);
  });
}

$(function(){
  $('#register').on('click',function(){
    var pro = $('#input_pro').val();
    var ans = $('#input_ans').val();
    console.log(pro+","+ans);
    liff.sendMessages([
      {
        type:'text',
        text:pro+","+ans
      }
    ])
    .then(() => {
      console.log('register message sent');
      $('#result').html('<a id="result">'+'問題:'+pro+',解答:'+ans+'で送信完了</a>');
    })
    .catch((err) => {
      console.log('error', err);
    });
  });

  $('#done').on('click',function(){
      liff.sendMessages([
        {
          type:"text",
          text:"まとめて追加を終了"
        }
      ])
      .then(() => {
        console.log('done message sent');
      })
      .catch((err) => {
        console.log('error', err);
      });
    liff.closeWindow();
  });
});
