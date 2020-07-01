var mongoose= require('mongoose');
var dbUrl = 'mongodb://localhost:27017/boatingproject';
var express = require('express');
var router = express.Router();
var bodyParser=require("body-parser");
var db = mongoose.connection;
var Schema = mongoose.Schema;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var ChatSchema= Schema({
  sendername:String,
  sentDate:String,
  userID:String,
  roomID:String,
  message:String 
});

var Chat = mongoose.model('Chat', ChatSchema);

router.post('/getchat',function(req,res,next){
  var post_data=req.body;
  // var parentID=post_data.parentID;
   var getRoomID=post_data.roomID;
   console.log(post_data);
  console.log("ParentID: "+getRoomID );
  mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
    //create new object of above User model
    if(err){
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    }
    else{
      Chat.find({'roomID':getRoomID},function(err,data){
        if(err){
          throw err;
        }else{
          if(data!==null){
          console.log(data);
          return res.json(data);
        }
      
        }
      });
  
  }});
});

module.exports = function(ioImport) {
  io=ioImport;

  io.on("connection", (socket) => {
      console.log("Chat connected");
      socket.on("join", function (userNickname,roomId) {
          socket.join(roomId);
        console.log(userNickname + " : has joined the chat with id "+roomId);
  
        socket.broadcast.emit(
          "userjoinedthechat",
          userNickname + " : has joined the chat "
        );
      });
      socket.on("messagedetection", (senderNickname, messageContent,userID,roomID,dateInString) => {
          socket.join(roomID);

          mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
              //create new object of above User model
              if(err){
                console.log("Error in communicating with database");
                return res.json("Error in communicating with database");
              }
              else{
                var chat=new Chat({
                  'roomID':roomID,
                  'sendername':senderNickname,
                  'sentDate':dateInString,
                  'userID':userID,
                  'message':messageContent
      
               });
                chat.save();
                console.log("added " +roomID+"/n");
            }
          });
        //log the message in console
        console.log("in messgedetected")
        console.log(senderNickname + " : " + messageContent);
  
        //create a message object
  
        let message = { message: messageContent, senderNickname: senderNickname };
        console.log("message"+message);
  
        // send the message to all users including the sender  using io.emit()
  
        io.to(roomID).emit("message", { message: messageContent, senderNickname: senderNickname });
        console.log("Message emitted");

      });
  
      socket.on("disconnect", function () {
        console.log( "user has left ");
  
        socket.broadcast.emit("userdisconnect", " user has left");
      });
    });
return router;
}



// module.exports = router;
