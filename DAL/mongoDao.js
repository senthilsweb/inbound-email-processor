var mongoClient = require('mongodb').MongoClient
, fs = require('fs')
, myDb = null;

var filename = "./config.json";
var config = JSON.parse (fs.readFileSync(filename,'utf8'));

mongoClient.connect(config.mongodb.url, function (err, db) {
    if (!err) {
        myDb = db;
        console.log("Mongo Connected");       
    } else { return console.dir(err);}
});

//---------------------------------------------------------------------------------------------------------
// Save object to MongoDB
//---------------------------------------------------------------------------------------------------------
exports.save = function(obj) {
        var collection = myDb.collection(config.mongodb.collection)
        collection.insert(JSON.parse(obj), function (err, result) { 
                 if (err!=null)
                            console.log("Error = " + err);
              });
}