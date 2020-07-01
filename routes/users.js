var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var dbUrl = 'mongodb://localhost:27017/boatingproject';
var User = require('./userSchema');
var Review = require('./reviewSchema');
var Notification = require('./notificationSchema');
const result =require('dotenv').config()

const nodemailer = require("nodemailer");
var randomstring = require('randomstring');
var Ride = require('./rideSchema');

//Verification Mail
function sendVerificationMail(user) {
  async function main() {

    let testAccount = await nodemailer.createTestAccount();
    console.log(user.username);
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.LOGIN,
        pass: process.env.PASS
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Boating Service" <mrmunir235@gmail.com>', // sender address
      to: user.username, // list of receivers
      subject: "Please Verify Your Email Address ! ✔", // Subject line
      html: `<h1>Welcome ${user.firstName} </h1><p> We are glad to have you with us.<br>
       Please enter the following verification code in order to verify your account:<br>
       <b>${user.secretToken}</b> <br>
       Have a nice day !
       `
    });

    console.log("SENT MAIL !");

  }

  main().catch(console.error);

}

//Reset Mail
function sendResetMail(user) {
  async function main() {

    let testAccount = await nodemailer.createTestAccount();
    console.log(user.username);
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'TahaBohra',
        pass: '@Letmein786'
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Boating Service" <mrmunir235@gmail.com>', // sender address
      to: user.username, // list of receivers
      subject: "Password reset Instructions !", // Subject line
      html: `<h1>Hello ${user.firstName} </h1><p> It looks like you requested to reset your password.<br>
       Please enter the following verification code in order to reset your password:<br>
       <b>${user.secretToken}</b> <br>
       Have a nice day !
       `
    });
  }
  main().catch(console.error);
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/test', function (req, res, next) {
  var post_data = req.body
  var xyz = post_data.test
  var a = post_data.asd
  console.log(a)
  console.log(xyz)
  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {

      var user = new User({
        'firstName': xyz,
        'lastName': a
      });

      console.log("NAME IN SIGN UP : " + user.firstName);

      //save it
      user.save();

    }
  });

});
router.post('/addAcountDetails', function (req, res, next) {
  var post_data = req.body
  var User_id = post_data.User_id
  var bio = post_data.bio
  var mobile = post_data.mobile
  var emergencyMobile = post_data.emergencyMobile
  var driverID = post_data.driverID
  var city = post_data.city;
  var firstName = post_data.firstName;
  var lastName = post_data.lastName;


  
  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      User.findById(User_id, function (err, data) {
        if (err) {
          throw err;
        } else {
          data.driverID=driverID;
          data.mobile=mobile;
          data.emergencyMobile=emergencyMobile;
          data.city=city;
          data.bio=bio;
          data.firstName=firstName;
          data.lastName=lastName;

          data.save(function (err, usrr) {
            if (err) {
              console.log("Error while verifying your account.");
              return res.json("Error while verifying your account.");
            } else {
              console.log("Verification Successful.");
              return res.json("Verification Successful.");
            }
          });

        }
      });
      
      

    }
  });

});


//Create Account Route
router.post('/signup', function (req, res, next) {
  console.log("====================================SIGN UP REQUEST !!!!")
  //fetch values from request
  var post_data = req.body;
  var usrnm = post_data.username;
  var passwd = post_data.password;
  var firstName = post_data.firstName;
  var lastName = post_data.lastName;
  var dob = post_data.dob;
  var gender = post_data.gender;

  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      User.findOne({
        'username': usrnm
      }, function (err, data) {

        if (err) {
          throw err;
        } else {
          if (data === null) {
            var secretToken = randomstring.generate();
            //Create User and assign secret token and set it inactive as well
            var user = new User({
              'firstName': firstName,
              'lastName': lastName,
              'username': usrnm,
              'password': passwd,
              'dob': dob,
              'gender': gender
            });
            user.secretToken = secretToken;
            user.active = false;

            console.log("NAME IN SIGN UP : " + user.firstName);

            //save it
            user.save(function (err, usrr) {
              if (err) {
                console.log("Error while creating your account.");
                return res.json("Error while creating your account.");
              } else {
                sendVerificationMail(user);

                console.log("Verification email sent.");
                return res.json("Sign up successfull. Please check your email for verification code.");
              }
            });
          } else {
            console.log("Already Registered.");
            return res.json("Already registered.");
          }
        }


      });

    }
  });
});

router.post('/login', function (req, res, next) {

  //fetch values from request
  var post_data = req.body;
  var usrnm = post_data.username;
  var passwd = post_data.password;
  console.log("Data" + post_data);
  console.log("Username: " + usrnm + " Password: " + passwd);

  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      User.findOne({
        'username': usrnm,
        'password': passwd
      }, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            var respondWithJson = {
              'message': "Invalid Username/Password Combination."
            }
            console.log("Incorrect Username/Password combination.");
            return res.json(respondWithJson);
          } else {

            if (data.active) {
              console.log("Login Successfull.");
              console.log("data after login",data)
              var objid = data.id;
              var parentName = data.firstName;

              var respondWithJson = {
                'id': objid,
                'Name': parentName,
                'data':data,
                'message': "Login Successfull."
              }
              console.log("Name of logged in user:" + respondWithJson.parentName);
              return res.json(respondWithJson);
            } else {
              console.log("Account not activated yet/Email not verified yet.");
              return res.json("Please verify your email first.");
            }
          }
        }
      });
    }
  });
});

//Verify Email Route
router.post('/verifyEmail', function (req, res, next) {

  //fetch values
  var post_data = req.body;
  var usrnm = post_data.username;
  var secretToken = post_data.secretToken;

  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      User.findOne({
        'username': usrnm,
        'secretToken': secretToken
      }, function (err, data) {

        if (err) {
          throw err;
        } else {
          if (data === null) {
            console.log("Invalid Username / Verification Code Combination.");
            return res.json("Invalid Username / Verification Code Combination.");
          } else {
            data.secretToken = randomstring.generate();
            data.active = true;
            data.save(function (err, usrr) {
              if (err) {
                console.log("Error while verifying your account.");
                return res.json("Error while verifying your account.");
              } else {
                console.log("Verification Successful.");
                return res.json("Verification Successful.");
              }
            });
          }
        }
      });
    }
  });

});


//Generate Forget Password Email
router.post('/forgetPassword', function (req, res, next) {
  //fetch values from request
  var post_data = req.body;
  var usrnm = post_data.username;
  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      User.findOne({
        'username': usrnm
      }, function (err, user) {

        if (err) {
          throw err;
        } else {
          if (user === null) {
            console.log("Email not registered.");
            return res.json("Email not registered.");
          } else {

            var secretToken = randomstring.generate();

            user.secretToken = secretToken;
            console.log(user.firstName);

            //save it
            user.save(function (err, usrr) {
              if (err) {
                console.log("Error while sending email.");
                return res.json("Error while sending email.");
              } else {
                sendResetMail(user);
                console.log("Please Check your email for reset code code.");
                return res.json("Please Check your email for reset code.");
              }
            });
          }
        }


      });

    }
  });
});

//Reset Pass
router.post('/resetForgotPassword', function (req, res, next) {

  //fetch values from request
  var post_data = req.body;
  var usrnm = post_data.username;
  var secretToken = post_data.secretToken;
  var NewPassword = post_data.newPassword;

  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {

      User.findOneAndUpdate({
          'username': usrnm,
          'secretToken': secretToken
        }, {
          'password': NewPassword
        }, function (err, data) {
          if (err) {
            throw err;
          } else {
            if (data === null) {
              console.log("Invalid Username / Verification Code !");
              return res.json("Invalid Username / Verification Code !");
            } else {
              var secretToken = randomstring.generate();
              data.secretToken = secretToken;
              data.save()
              console.log("Password Reset Successfully");
              return res.json("Password Reset Successfully");
            }
          }
        }

      );

    }
  });
});


router.post('/getProfile', function (req, res, next) {

  //fetch values from request
  var post_data = req.body;
  var user_id = post_data.id;
  console.log("Data" + post_data);
  console.log("USER ID: " + user_id);

  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      User.findOne({
        '_id': user_id
      }, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            var respondWithJson = {
              'message': "Cannot find user with user id: " + user_id
            }
            console.log("Error finding user with user id : " + user_id);
            return res.json(respondWithJson);
          } else {
            console.log("Found USER !!!!!!");


            console.log("USER DETAILS: " + data);
            return res.json(data);

          }
        }
      });
    }
  });
});



//offer a ride
router.post('/offer-a-ride', function (req, res, next) {
  console.log("====================================OFFER A RIDE REQUEST !!!!")
  //fetch values from request
  var post_data = req.body;
  var user_id = post_data.user_id;
  var dearture_city = post_data.dearture_city;
  var departure_time = post_data.departure_time;
  var ride_type = post_data.ride_type;
  var seats = post_data.seats;
  var name = post_data.name;
  var reserved_users = [];
  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      var ride = new Ride({
        'user_id': user_id,
        'name': name,
        'dearture_city': dearture_city,
        'departure_time': departure_time,
        'ride_type': ride_type,
        'seats': seats,
        "status": "active"
      });
      ride.reserved_users = reserved_users;

      console.log("BOAT OWNER NAME : " + ride.name);
      console.log("CITY OF DEPARTURE : " + ride.dearture_city);

      //save it
      ride.save(function (err, usrr) {
        if (err) {
          console.log(err);
          console.log("Error while creating your ride.");
          resObj = {
            error: "true",
            message: "Error while creating your ride."
          }
          return res.json(resObj);
        } else {
          console.log("Ride offered successfully.");
          resObj = {
            error: "false",
            message: "Ride offered successfully."
          }
          return res.json(resObj);
        }
      });

    }
  });
});


//Get list of rides 
router.post('/find-rides', function (req, res, next) {
  console.log("====================================FIND RIDES REQUEST !!!!")

  //fetch values from request
  var post_data = req.body;
  var city = post_data.city;
  var date_filter = post_data.date;
  var start = date_filter;
  var end = date_filter;
  console.log("REQUEST BODY DATE FILTER: " + date_filter)
  if (!date_filter || date_filter == "") {
    date_filter = new Date();
  }

  start = new Date(date_filter);
  end = new Date(date_filter);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  console.log("START DATE: " + start)
  console.log("END DATE: " + end)
  console.log("CITY: " + city);

  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Ride.find({
        'status': "active",
        'dearture_city': city,
        'departure_time': {
          $gte: start,
          $lte: end
        }
      }, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            var respondWithJson = {
              'error': 'true',
              'message': "Cannot find any ride in city: " + city
            }
            console.log("Cannot find any ride in city: : " + city);
            return res.json(respondWithJson);
          } else {
            console.log("Found RIDES !!!!!!");
            console.log("Ride DETAILS: " + data);
            resObj = {
              'error': "false",
              'data': data
            }
            return res.json(resObj);
          }
        }
      });
    }
  });
});


//Get specific ride
router.post('/find-specific-ride', function (req, res, next) {
  console.log("====================================FIND SPECIFIC RIDE REQUEST !!!!")

  //fetch values from request
  var post_data = req.body;
  var ride_id = post_data.ride_id;

  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Ride.findById(ride_id, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            var respondWithJson = {
              'error': 'true',
              'message': "Cannot find any ride with id: " + ride_id
            }
            console.log("Cannot find any ride with id: " + ride_id);
            return res.json(respondWithJson);
          } else {
            console.log("FOUND THE RIDE !!!!!!");
            console.log("Ride DETAILS: " + data);
            resObj = {
              'error': "false",
              'data': data
            }
            return res.json(resObj);
          }
        }
      });
    }
  });
});


//book a ride
router.post('/book-a-ride', function (req, res, next) {
  console.log("====================================Book A RIDE REQUEST !!!!")
  //fetch values from request
  var post_data = req.body;
  var user_id = post_data.user_id;
  var user_name = post_data.name;
  var ride_id = post_data.ride_id;
  var driver_Id = post_data.driver_Id;
  var driver_name=post_data.driver_name;
  // connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {

      Ride.findOne({
        '_id': ride_id
      }, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            var respondWithJson = {
              'error': 'true',
              'message': "Cannot find ride"
            }
            console.log("Error finding ride with id: " + ride_id);
            return res.json(respondWithJson);
          } else {
            console.log("Found RIDE !!!!!!");
            console.log("RIDE CITY: " + data.dearture_city);
            console.log("ALREADY RESERVED USERS: " + data.reserved_users);
            if (data.ride_type == "instant") {
              if (data.seats > 0) {
                console.log("INSIDE INSTANT")
                usrObj = {
                  "user_id": user_id,
                  'name': user_name,
                  "booking_status": "booked",
                  "is_review": "false"
                }
                data.reserved_users.push(usrObj)
                data.seats = data.seats - 1;
                console.log("SEATS LEFT: " + data.seats)
                data.save(function (err, dat) {
                  if (err) {
                    console.log(err);
                    console.log("Error while reserving.");
                    resObj = {
                      error: "true",
                      message: "Error while reserving."
                    }
                    return res.json(resObj);
                  } else {
                    console.log("Ride reserved successfully.");
                    var datetime = new Date();

                    var notifyObj = new Notification({
                      "User_id": driver_Id,
                      "description": "Ride has been reserved with " + user_name,
                      "time": datetime.toISOString().slice(0, 10)
                    })

                    //var notifyObj=new Notification({"User_id":driver_Id,"description":"Ride has been reserved with "+user_name,"time":datetime.toISOString().slice(0,10)})
                    notifyObj.save();
                    console.log("================NOTIFICATION RIDE RESERVED ==========with user" + user_name);


                    var notifyObj = new Notification({
                      "User_id": user_id,
                      "description": "Your Ride has been Booked ",
                      "time": datetime.toISOString().slice(0, 10)
                    })

                    //var notifyObj=new Notification({"User_id":driver_Id,"description":"Ride has been reserved with "+user_name,"time":datetime.toISOString().slice(0,10)})
                    notifyObj.save();
                    console.log("================NOTIFICATION RIDE RESERVED ==========with user" + user_name);

                    resObj = {
                      error: "false",
                      message: "Ride reserved successfully."
                    }
                    return res.json(resObj);
                  }
                });
              } else {
                console.log("ALL SEATS BOOKED ALREADY.");
                resObj = {
                  error: "true",
                  message: "All seats booked already."
                }
                return res.json(resObj);
              }
            } else {
              usrObj = {
                "user_id": user_id,
                'name': user_name,
                "booking_status": "pending",
                "is_review": "false"
              }
              data.reserved_users.push(usrObj)
              data.save(function (err, dat) {
                if (err) {
                  console.log(err);
                  console.log("Error while reserving.");
                  resObj = {
                    error: "true",
                    message: "Error while reserving."
                  }
                  return res.json(resObj);
                } else {
                  var datetime = new Date();
                  console.log(datetime.toISOString().slice(0, 10));
                  console.log("Ride reserved successfully.");
                  var notifyObj = new Notification({
                    "User_id": user_id,
                    "description": "Ride has been Requested with Driver :" + driver_name,
                    "time": datetime.toISOString().slice(0, 10)
                  })
                  notifyObj.save();
                  console.log("================NOTIFICATION RIDE RESERVED ==========");

                  resObj = {
                    error: "false",
                    message: "Ride reserved successfully."
                  }
                  return res.json(resObj);
                }
              });
            }
          }
        }
      });



    }
  });
});

//update a reservation request
router.post('/update-pending-reservation', function (req, res, next) {
  console.log("====================================UPDATE A PENDING REQUEST!!!!")
  //fetch values from request
  var post_data = req.body;
  var user_id = post_data.user_id;
  var ride_id = post_data.ride_id;
  var is_reservation = post_data.is_reservation;
  // connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {

      Ride.findOne({
        '_id': ride_id
      }, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            var respondWithJson = {
              'error': 'true',
              'message': "Cannot find ride"
            }
            console.log("Error finding ride with id: " + ride_id);
            return res.json(respondWithJson);
          } else {
            if (is_reservation == "yes") {

              if (data.seats > 0) {
                Ride.findOneAndUpdate({
                  '_id': ride_id,
                  'reserved_users.user_id': user_id
                }, {
                  '$set': {
                    'reserved_users.$.booking_status': 'booked',
                  },
                  $inc: {
                    'seats': -1
                  }
                }, function (err, rez) {
                  if (err) {
                    resObj = {
                      error: "true",
                      message: "Reservation approval error."
                    }
                    return res.json(resObj);
                  } else {
                    var datetime = new Date();
                    var notifyObj = new Notification({
                      "User_id": user_id,
                      "description": "Pending Ride has been accepted ",
                      "time": datetime.toISOString().slice(0, 10)
                    })
                    notifyObj.save();
                    console.log("=================== Ride accepted Nofication ======================");

                    resObj = {
                      error: "false",
                      message: "Reservation approved successfully."
                    }
                    return res.json(resObj);
                  }

                });
              } else {
                console.log("ALL SEATS BOOKED ALREADY.");
                resObj = {
                  error: "true",
                  message: "All seats booked already."
                }
                return res.json(resObj);
              }

            }
            //   console.log("Found RIDE !!!!!!");
            //   console.log("RIDE CITY: "+data.dearture_city);
            //   console.log("ALREADY RESERVED USERS: "+data.reserved_users);
            //   if (is_reservation=="yes"){ 
            //       usrObj={"user_id":user_id,"booking_status":"booked"}
            //       data.reserved_users.push(usrObj)
            //       data.save(function(err,dat){
            //         if(err){
            //           console.log(err);
            //           console.log("Error while reserving.");
            //           resObj={error:"true",message:"Error while reserving."}
            //           return res.json(resObj);
            //         }
            //         else{
            //           console.log("Ride reserved successfully.");
            //           resObj={error:"false",message:"Ride reserved successfully."}
            //           return res.json(resObj);
            //         }
            //       }); 

            // }
            else {
              Ride.findByIdAndUpdate(
                ride_id, {
                  $pull: {
                    "reserved_users": {
                      "user_id": user_id
                    }
                  }
                }, {
                  safe: true,
                  upsert: true
                },
                function (err, rez) {
                  if (err) {
                    resObj = {
                      error: "true",
                      message: "Reservation cancelled error."
                    }
                    return res.json(resObj);
                  } else {

                    var notifyObj = new Notification({
                      "User_id": user_id,
                      "description": "Pending Ride has been Rejected ",
                      "time": datetime.toISOString().slice(0, 10)
                    })
                    notifyObj.save();
                    console.log("=================== Ride Rejection Nofication ======================");

                    resObj = {
                      error: "false",
                      message: "Reservation cancelled successfully."
                    }
                    return res.json(resObj);
                  }

                });

            }

          }
        }
      });

    }
  });
});


//Get pending rides
router.post('/find-pending-rides', function (req, res, next) {
  console.log("====================================FIND PENDING RIDE REQUEST !!!!")

  //fetch values from request
  var post_data = req.body;
  var user_id = post_data.user_id;

  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Ride.findOne({
        'user_id': user_id,
        "status": "active"
      }, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            console.log("Cannot find any DRIVER with id: " + user_id);
            //Find in reserved users
            Ride.findOne({
              status: "active",
              "reserved_users.user_id": user_id
            }, function (err, newdata) {
              if (err) {
                throw err;
              } else {
                if (newdata === null) {

                  Ride.findOne({
                    "reserved_users.user_id": user_id,
                    "reserved_users.is_review": "false"
                  }, function (err, reviewData) {
                    if (err) {
                      throw err;

                    } else if (reviewData == null) {
                      console.log("Cannot find any USER with id: " + user_id);
                      resObj = {
                        'error': "false",
                        'data': reviewData,
                        'is_driver': 0,
                        'is_user': 0,
                        'is_review': "true"
                      }
                      return res.json(resObj);
                    } else {
                      console.log("Cannot find any USER with id: " + user_id);
                      resObj = {
                        'error': "false",
                        'data': reviewData,
                        'is_driver': 0,
                        'is_user': 0,
                        'is_review': "false"
                      }
                      return res.json(resObj);
                    }


                  })

                  // console.log("Cannot find any USER with id: "+user_id);
                  // resObj={'error':"false",'data':data,'is_driver':0, 'is_user':0}
                  // return res.json(resObj); 

                } else {
                  console.log("FOUND THE DRIVER  !!!!!!");
                  console.log("Ride DETAILS: " + newdata);
                  resObj = {
                    'error': "false",
                    'data': newdata,
                    'is_driver': 0,
                    'is_user': 1
                  }
                  return res.json(resObj);
                }
              }
            });
          } else {
            console.log("FOUND THE DRIVER  !!!!!!");
            console.log("Ride DETAILS: " + data);
            resObj = {
              'error': "false",
              'data': data,
              'is_driver': 1,
              'is_user': 0
            }
            return res.json(resObj);


          }
        }
      });


    }
  });
});


// //Get pending rides cHANGED
// router.post('/find-pending-rides',function(req,res,next){
//   console.log("====================================FIND PENDING RIDE REQUEST !!!!")

//   //fetch values from request
//   var post_data=req.body;
//   var user_id=post_data.user_id;

//   //connect with DB
//   mongoose.connect(dbUrl, {useNewUrlParser:true},function (err) {
//   if(err){
//     console.log("Error in communicating with database");
//     return res.json("Error in communicating with database");
//   }
//   else{
//     Ride.findOne({'user_id':user_id, "status":"active"},function(err,data){
//       if(err){
//         throw err; 
//       }
//       else{
//         if(data===null){          
//             console.log("Cannot find any DRIVER with id: "+user_id);
//             //Find in reserved users
//             var temp_userID=user_id;
//             Ride.findOne({ "reserved_users.user_id": user_id},function(err,newdata){
//               if(err){
//                 throw err; 
//               }
//               else{
//                 // TO DO : IF THE STATUS == ONLINE AND USER IS ALSO NOT FOUND THEN 
//                 if(newdata===null){

//                     console.log("Cannot find any USER with id: "+user_id);
//                     resObj={'error':"false",'data':data,'is_driver':0, 'is_user':0}
//                     return res.json(resObj); 
//                    //IF ACTIVE IS FOUND AND ALSO USER IS FOUND IN THE RESERVED RIDES THEN RIDE IS RESERVED   
//                 }else if(newdata.status==="active"){

//                         console.log("FOUND THE DRIVER  !!!!!!");
//                         console.log("Ride DETAILS: "+newdata);
//                         resObj={'error':"false",'data':newdata,'is_driver':0, 'is_user':1}
//                         return res.json(resObj); 

//                 }
//                 // IF THE STATUS IS REVIEW THEN THE DRIVER NEEDS REVIEW
//                 else if(newdata.status==="review"){
// console.log("====review call for ride======")
//                   console.log("FOUND THE DRIVER  !!!!!!");
//                   console.log("Ride DETAILS: "+newdata);
//                   resObj={'error':"false",'data':newdata,'is_driver':0, 'is_user':1}
//                   return res.json(resObj); 

//           }
//     //       else if(newdata.status==="active"&&newdata.reserved_users.user_id===null){

//     //         console.log("FOUND THE DRIVER  !!!!!!");
//     //         console.log("Ride DETAILS: "+newdata);
//     //         resObj={'error':"false",'data':newdata,'is_driver':0, 'is_user':1}
//     //         return res.json(resObj); 

//     // }
//               }
//               }
//           );
//         }else{
//                 console.log("FOUND THE DRIVER  !!!!!!");
//                 console.log("Ride DETAILS: "+data);
//                 resObj={'error':"false",'data':data,'is_driver':1, 'is_user':0}
//                 return res.json(resObj); 


//         }
//       }
//       }
//     );


// }});
// });



//End a Ride request
router.post('/end-ride', function (req, res, next) {
  console.log("====================================UPDATE A PENDING REQUEST!!!!")
  //fetch values from request
  var post_data = req.body;
  var ride_id = post_data.ride_id;

  // connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {

      Ride.findOne({
        '_id': ride_id
      }, function (err, data) {
        if (err) {
          throw err;
        } else {
          if (data === null) {
            var respondWithJson = {
              'error': 'true',
              'message': "Cannot find ride"
            }
            console.log("Error finding ride with id: " + ride_id);
            return res.json(respondWithJson);
          } else {

            data.status = "review"
            data.save()
            resObj = {
              'error': "false",
              'message': "success",
              'data': data
            }
            return res.json(resObj);
          }
        }

      });



    }
  });
});
//add review route
router.post('/add_review', function (req, res, next) {
  var post_data = req.body;
  var reviewNo = post_data.review;
  var rider_User_id = post_data.rider_User_id;
  var rider_name = post_data.rider_name;
  var driver_id = post_data.driver_id;
  var ride_id = post_data.ride_id;
  var driver_name=post_data.driver_name;
  //connect with DB
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    //create new object of above User model
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {

      var review = new Review({
        'review': reviewNo,
        'rider_User_id': rider_User_id,
        'rider_name': rider_name,
        'driver_id': driver_id,
        'ride_id': ride_id,
        'driver_name':driver_name
      });

      console.log("Review Added");

      //save it
      review.save()

      Ride.findOne({
        "_id": ride_id,
        "reserved_users.user_id": rider_User_id
      }, function (err, data) {
        if (err) {
          throw err;

        } else {
          console.log("DATA RETURNED FROM FINDONE : "+data)
          console.log("uSER_ID: " + rider_User_id)

          for (var i = 0; i < data.reserved_users.length; i++) {
            console.log("Loop data " + data.reserved_users[i]);
            if (data.reserved_users[i].user_id == rider_User_id) {
              console.log(data.reserved_users[i].user_id + "Compared to " + rider_User_id);
              user_obj = data.reserved_users[i];
              user_obj.is_review = "true"
              console.log("USER OBJ "+ user_obj.name +" \t USER REVIEW STATUS "+user_obj.is_review)
              data.reserved_users.set(i, user_obj);
              
              data.save();
              console.log("DATA AFTER SAVED : "+data)  
              break;
            }

          }
            console.log("Data after for loop"+data)
            return res.json("Successfull")
        }
      });
    }
  });
});


router.post('/findReviews', function (req, res, next) {
  var post_data = req.body;

  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Review.find({}, function (error, data) {

      })
    }
  });

});

router.post('/findNotifications', function (req, res, next) {
  console.log("=============NOTIFICATION==============")
  var post_data = req.body;
  var User_id = post_data.User_id;
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Notification.find({
        "User_id": User_id
      }, function (err, data) {
        if (err) {
          throw err;

        } else if (data != null) {
          console.log("Notifications data " + data)
          // const sorteddata = data.sort((a, b) => b.date - a.date)
          // console.log("Notifications sorteddata " + sorteddata)
          return res.json({
            'error': false,
            'data': data
          });
        } else if (data == null) {
          return res.json({
            'error': true
          })
        }
      })
    }
  });

});


//recieve ratings



router.post('/recieveRatings', function (req, res, next) {
  console.log("====================left Ratings ============================ ")

  var post_data = req.body;
  var User_id = post_data.User_id;
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Review.find({
        "driver_id": User_id
      }, function (err, data) {
        if (err) {
          throw err;
        } else if (data != null) {
          console.log("left Ratings Data :" + data)
          return res.json({
            'error': false,
            'data': data
          });
        } else if (data == null) {
          return res.json({
            'error': true
          })
        }
      })
    }
  });
});

//left notification

router.post('/leftRatings', function (req, res, next) {
  console.log("====================left Ratings ============================ ")

  var post_data = req.body;
  var User_id = post_data.User_id;
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Review.find({
        "rider_User_id": User_id
      }, function (err, data) {
        if (err) {
          throw err;
        } else if (data != null) {
          console.log("left Ratings Data :" + data)
          return res.json({
            'error': false,
            'data': data
          });
        } else if (data == null) {
          return res.json({
            'error': true
          })
        }
      })
    }
  });
});

//checking review of a user wether  he has given it or not 
router.post('/checkReview', function (req, res, next) {
  var post_data = req.body;
  var User_id = post_data.User_id;
  var ride_id = post_data.ride_id;
  console.log("=====Review Request params ======")
  console.log("User_id:" + User_id + "ride_id" + ride_id)

  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log("Error in communicating with database");
      return res.json("Error in communicating with database");
    } else {
      Review.find({
        "rider_User_id": User_id,
        "ride_id": ride_id
      }, function (error, data) {
        if (err) {
          throw err;

        } else if (data == null) {
          console.log("=====Review Not Found  ======")

          return res.json("Review not found");

        } else if (data != null) {
          console.log("=====Review Found data ======")
          console.log(data);
          return res.json("Review found");

        }
      })
    }
  });

});

module.exports = router;