var notifier = require('mail-notifier')
, fs = require('fs')
, stream = require('stream')
, MongoClient = require('mongodb').MongoClient
, dbHelper = require('./routes/dbFacade');

var filename = __dirname + "/config.json";
var config = JSON.parse (fs.readFileSync(filename,'utf8'));

var imap = {
        user: config.username,
        password: config.password,
        host: config.imap.host,
        port: config.imap.port,
         tls: true,// use secure connection
        tlsOptions: { rejectUnauthorized: false }
};

//---------------------------------------------------------------------------------------------------------
// Mail sniffer mail receive event
//---------------------------------------------------------------------------------------------------------
var inboundEmailManager  = notifier(imap).on('mail', function (mail) {

    //Build a custom json email message
    var msg = {};
    msg.date = mail.date;
    msg.plaintextbody = mail.text;
    msg.subject = mail.subject;
    msg.to = JSON.stringify(mail.to);
    msg.id = mail.messageId;
    msg.from = JSON.stringify(mail.from);
    
    //[Optional]Save the email message to Mongo
   dbHelper.save(JSON.stringify(msg));

    //Check for attachments, if exists extract each attachment and save it to the file system
    if (mail.attachments) {
        mail.attachments.forEach(function (attachment) {
            fs.writeFile( __dirname + "/uploads/" + attachment.generatedFileName, attachment.content, 'base64', function(err) {
                   if (err!=null)
                        console.log("Error = " + err);
                });
        });
    }
    //[Optional]Save the email message to file system as .txt
    /*fs.writeFile("/tmp/test/email_" + mail.messageId + '.txt', JSON.stringify(msg), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });*/
});

//---------------------------------------------------------------------------------------------------------
// Mail sniffer end event
//---------------------------------------------------------------------------------------------------------
inboundEmailManager.on('end',function(){
  console.log('mail sniffer ended');
});

//Star the Mail sniffer
inboundEmailManager.start();
