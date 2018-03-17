exports = module.exports = {};
var main = require('./main.js');
// REQUIRED NODE MODULES //
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
// DECLARE MONGODB AND MONGOOSE //
var mongoDB = "mongodb://Nicole73:Storm7337@travel-app-cluster-shard-00-00-7fwgj.mongodb.net:27017,travel-app-cluster-shard-00-01-7fwgj.mongodb.net:27017,travel-app-cluster-shard-00-02-7fwgj.mongodb.net:27017/test?ssl=true&replicaSet=Travel-App-Cluster-shard-0&authSource=admin";
mongoose.connect(mongoDB);
// SETUP MONGOOSE //
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// DEFINE A SCHEMA //
var Schema = mongoose.Schema;

// Stores list of users
var userSchema = new Schema({
    email: String,
    fName: String,
    lName: String,
    password: String, 
});

var tripsSchema = new Schema({
    tripID: String, // Match tripID in daySchema and entrySchema
    creatorEmail: String, // Match creatorEmail in daySchema and entrySchema
    tripName: String, // Match tripName in daySchema and entrySchema
    cities: Array, // [[city, country], ]
    hasAccess: Array, // Who has access (their email)
    numDays: Number,
    numNights: Number,
    startDate: String, // YYYY-MM-DD
    endDate: String // YYYY-MM-DD
});

var daySchema = new Schema({
    tripId: String, // Match tripId in tripsSchema and entrySchema
    creatorEmail: String, // Match creatorEmail in tripsSchema and entrySchema
    tripName: String, // Match tripName in tripsSchema and entrySchema
    cities: Array, // Can be one or more [[city, country], ]
    day: String, // YYYY-MM-DD
    done: Boolean, // Default to false
});

entrySchema = new Schema({
    tripId: String, // Match tripId in tripsSchema and daySchema
    creatorEmail: String, // Match creatorEmail in tripsSchema and daySchema
    tripName: String, // Match tripName in tripsSchema and daySchema
    day: String, // YYYY-MM-DD
    // From form
    title: String,
    startTime: String, // HH:MM:SS (24 hour format)
    endTime: String, // HH:MM:SS (24 hour format)
    cities: Array, // Can be one or more [[city, country], ]
    type: {type: String, enum: ["Housing", "Transportation", "Food", "Attractions", "Other"]}, // Drop down
    price: Number, // CAD
    reserved: Boolean,
    desc: String,
    links: Array, // [[name, link], ]
});


// CREATE AND SAVE A MODEL //
// Compile model from schema
var userModel = mongoose.model('UserModel', userSchema);
var tripsModel = mongoose.model('TripsModel', tripsSchema);
var dayModel = mongoose.model('DayModel', daySchema);
var entryModel = mongoose.model('EntryModel', entrySchema);

// Intialize User (Signup)
exports.signup = function(fName, lName, email, pass, res){
    // Check if user with email already exists
    userModel.findOne({ "email": email }, '', function (err, results) {
        if (results != null){ // Email already exists
            response = {
                'error': 2,
                'Message': "Email already exists"
            }
            res.status(200).send(response);
        } else if (err != null){ // Error
            response = {
                'error': 1,
                'Message': "Error on signup"
            }
            res.status(200).send(response); 
        } else { // Create user
            userModel.create({
                email: email,
                entriesCount: 0,
                creditCount: 0,
                first_name: fName,
                last_name: lName,
                password: main.sha256(pass)
            }, function (err, result) {
                if (err){
                    response = {
                        'error': 1,
                        'Message': err
                    }
                } else{
                    response = {
                        'error':0,
                        'Message': "Successfully created user"
                    }
                }
                res.status(200).send(response);
            });
        }
    });
}
// Login User (Login)
exports.login = function(email, pass, res){
    var hashed_pass = main.sha256(pass);
    userModel.findOne({ "email": email }, '', function (err, results) {
        if (hashed_pass === results.password){
            response = {
                'error': 0,
                'Message': "Logged in successfully",
                'data': {
                    'fName': results.first_name,
                    'lName': results.last_name,
                    'email': email
                }
            }
            res.status(200).send(response);
        } else { // Email and password don't match
            response = {
                'error': 2,
                'Message': "Email and username don't match"
            }
            res.status(200).send(response);
        }
    });
}

// Render Dashboard
exports.getDashboardData = function(email, res){
    res.render('index');
//     var month = main.getCurrentTime("month");
//     var year = main.getCurrentTime("year");
//     console.log("MONTH: ", month);
//     console.log("YEAR: ", year);
//     entriesModel.find({ "month": month, "year": year, "email": email }, '', function (err, results) {
//         // Return data for dashboard
//         console.log(results);
//         var renderObj = {
//             I: 0,
//             E: 0,
//             savings: 0,
//             food: 0,
//             rent: 0,
//             personal: 0,
//             entertainment: 0,
//             school: 0,
//             miscellaneous: 0,
//             projects: 0
//         }
//         results.forEach(function(result){
//             renderObj[result.type] += result.amount; // Type
//             renderObj[result.ie] += result.amount; // Income or expense
//         });
//         console.log("RESULT: ", renderObj);
//         res.status(200).render("index", {
//             active: "Dashboard",
//             expenses: renderObj.E,
//             income: renderObj.I,
//             savings: renderObj.savings,
//             food:  renderObj.food,
//             rent:  renderObj.rent,
//             personal: renderObj.personal,
//             entertainment: renderObj.entertainment,
//             school: renderObj.school,
//             miscellaneous: renderObj.miscellaneous,
//             projects: renderObj.projects
//         });
//     });
// }
}

// Create entry into the entries model DB
exports.createEntry = function(email, day, month, year, ie, amount, mop, desc, type, country, company, res){
    userModel.find({ "email": email }, '', function (err, results) {
        var newCount = results[0].entriesCount + 1;
        entriesModel.create({
            email: email,
            entryNum: newCount,
            month: month,
            day: day,
            year: year,
            ie: ie,
            amount: amount,
            mop: mop,
            desc: desc,
            type: type,
            country: country,
            company: company
        }, function (err, resultCreate) {
            if (err == null){
                userModel.update({ "email": email }, {$set: {"entriesCount": (newCount)}},
                    function(err, resultUser){
                        if (resultUser.nModified !== 1){
                            response = {
                                'error': 1,
                                'Message': "Error updating user profile entry count (" + err + ")"
                            }
                            res.status(200).send(response);
                        } else {
                            response = {
                                'error': 0,
                                'Message': "Successfully created entry"
                            }
                            res.status(200).send(response);
                        }
                    }
                );
            } else {
                response = {
                    'error': 1,
                    'Message': "Error updating user profile (" + err + ")"
                }
                res.status(200).send(response);
            }
        });
    });
}

// Create entry into the entries model DB
exports.createCreditEntry = function(email, day, month, year, amount, mop, cc, dayStart, monthStart, yearStart,
    dayEnd, monthEnd, yearEnd, res){
    userModel.find({ "email": email }, '', function (err, results) {
        var newCount = results[0].creditCount + 1;
        creditModel.create({
            email: email,
            entryNum: newCount,
            month: month, // M
            day: day, // D
            year: year, // YYYY
            amount: amount,
            cc: cc,
            mop: mop,
            monthStart: monthStart, // M
            dayStart: dayStart, // D
            yearStart: yearStart, // YYYY
            monthEnd: monthEnd, // M
            dayEnd: dayEnd, // D
            yearEnd: yearEnd // YYYY
        }, function (err, resultCreate) {
            if (err == null){
                userModel.update({ "email": email }, {$set: { "creditCount": newCount }},
                    function(err, resultUser){
                        if (resultUser.nModified !== 1){
                            response = {
                                'error': 1,
                                'Message': "Error updating user profile credit count (" + err + ")"
                            }
                            res.status(200).send(response);
                        } else {
                            response = {
                                'error': 0,
                                'Message': "Successfully created credit entry"
                            }
                            res.status(200).send(response);
                        }
                    }
                );
            } else {
                response = {
                    'error': 1,
                    'Message': "Error updating user profile (" + err + ")"
                }
                res.status(200).send(response);
            }
        });
    });
}

// Render view-entries page
exports.renderViewEntries = function(email, res){
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthInt = main.getCurrentTime("month");
    var month = months[monthInt - 1];
    var year = main.getCurrentTime("year");
    // Get entries data
    entriesModel.find({ "email": email, "year": year }, '', function (err, eResults) {
        if (err != null){
            response = {
                'error': 1,
                'Message': "Error on getting entries data (" + err + ")"
            }
            res.status(200).send(response);
        } else {
            monthResults = [];
            yearResults = [];
            eResults.forEach(function(result){
                if (result.month == monthInt){
                    monthResults.push({
                        id: result.id,
                        date: result.year + "-" + result.month + "-" + result.day,
                        amount: result.amount,
                        ie: result.ie,
                        type: result.type,
                        mop: result.mop,
                        comp: result.company,
                        desc: result.desc
                    });
                }
                yearResults.push({
                    id: result.id,
                    date: result.year + "-" + result.month + "-" + result.day,
                    amount: result.amount,
                    ie: result.ie,
                    type: result.type,
                    mop: result.mop,
                    comp: result.company,
                    desc: result.desc
                });
            });
            // Get credit entries data
            creditModel.find({ "email": email, "year": year }, '', function (errCred, cResults) {
                if (errCred != null){
                    response = {
                        'error': 1,
                        'Message': "Error on getting credit entries data (" + errCred + ")"
                    }
                    res.status(200).send(response);
                }
                creditResults = [];
                cResults.forEach(function(cResult){
                    creditResults.push({
                        id: cResult.id,
                        date: cResult.year + "-" + cResult.month + "-" + cResult.day,
                        amount: cResult.amount,
                        cc: cResult.cc,
                        mop: cResult.mop,
                        startDate: cResult.yearStart + "-" + cResult.monthStart + "-" + cResult.dayStart,
                        endDate: cResult.yearEnd + "-" + cResult.monthEnd + "-" + cResult.dayEnd,
                    });
                });
                // Render view-entries file
                res.render('view-entries', {
                    active: "View Entries",
                    month: month,
                    year: year,
                    yearEntries: yearResults,
                    monthEntries: monthResults,
                    creditEntries: creditResults
                })
            });
        }
    });
}