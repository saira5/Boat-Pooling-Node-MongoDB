var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = Schema({

    User_id: {type: Schema.Types.ObjectId, ref:'User'},
    description:String,
    time:String

  });
  module.exports = mongoose.model('Notification', notificationSchema);
 