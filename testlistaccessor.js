var fs = require("fs");

/*
var Accessor = function() {
    this.addData = function (data){
        var list = JSON.parse(fs.readFileSync("./testlist.json", "utf8"));
        list.data.push(data);
        fs.writeFile("./testlist.json", JSON.stringify(param, null, '    '), function(err){
            if(err) throw err;
        });
    };

    this.getList = function (userId){
        var list = JSON.parse(fs.readFileSync("./testlist.json", "utf8"));
        var filteredList = "";
        filteredList = list.data.filter(function(item, index){
            if(item.userId == userId) return true;
        });
        return filteredList;
    }
}

module.exports = Accessor;
*/

exports.addData = function (data){
    var list = JSON.parse(fs.readFileSync("./testlist.json", "utf8"));
    list.data.push(data);
    fs.writeFile("./testlist.json", JSON.stringify(list, null, '    '), function(err){
        if(err) throw err;
    });
};

exports.getList = function (userId){
    var list = JSON.parse(fs.readFileSync("./testlist.json", "utf8"));
    var filteredList = "";
    filteredList = list.data.filter(function(item, index){
        if(item.userId == userId) return true;
    });

    return filteredList;
}

exports.clearList = function (){
    var list = {
        data: []
    };

    fs.writeFile("./testlist.json", JSON.stringify(list, null, '    '), function(err){
        if(err) throw err;
    });
}


