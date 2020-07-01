var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var reviewSchema = Schema({

    rider_User_id: {type: Schema.Types.ObjectId, ref:'User'},
    rider_name:String,
    review:String,
    ride_id:{type: Schema.Types.ObjectId, ref:'Ride'},
    driver_id:String,
    driver_name:String

  });
  module.exports = mongoose.model('Review', reviewSchema);
 