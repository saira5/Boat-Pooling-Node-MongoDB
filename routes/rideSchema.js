var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var rideSchema = Schema({
    user_id: {type: Schema.Types.ObjectId, ref:'User'},
    name:String,
    dearture_city:String,
    departure_time: Date,
    ride_type: String,
    seats: Number,
    status:String,
    reserved_users: []
  });
  module.exports = mongoose.model('Ride', rideSchema);
 