var main = require('./main.js');
var db = require('./db.js');

main.app.use(main.express.static(main.path.join(__dirname, 'public')));
// app.use(cors());
/* Use body-parser */
main.app.use(main.bodyParser.json());
main.app.use(main.bodyParser.urlencoded({ extended: false }));

// Use Cookie Parser
main.app.use(main.cookieParser());

main.app.set('view engine', 'ejs');

// At root route render index.ejs
main.app.get('/', function(req, res){
    // var userCookie = JSON.parse(req.cookies['currentUser']); // Use req.signedCookies for cookies that have been signed
    // db.getDashboardData(userCookie.email, res);
    db.getDashboardData("n2rosari@edu.uwaterloo.ca", res);
});
main.app.get('/dashboard.ejs', function(req, res){
    var userCookie = JSON.parse(req.cookies['currentUser']); // Use req.signedCookies for cookies that have been signed
    db.getDashboardData(userCookie.email, res);
});

main.app.get('/:path', function(req, res){
    res.render(req.params.path);
});

// Pages (Single element in render object)
main.app.get('/add-entries.ejs', function(req, res){ res.status(200).render('add-entries'); });
main.app.get('/notifications.ejs', function(req, res){ res.status(200).render('notifications'); });
main.app.get('/customization.ejs', function(req, res){ res.status(200).render('customization'); });
main.app.get('/user.ejs', function(req, res){ res.status(200).render('user'); });
main.app.get('/login.ejs', function(req, res){ res.status(200).render('login'); });
main.app.get('/signup.ejs', function(req, res){ res.status(200).render('signup'); });
// Pages (Multiple elements in the render object)
main.app.get('/view-entries.ejs', function(req, res){
    var userCookie = JSON.parse(req.cookies['currentUser']); // Use req.signedCookies for cookies that have been signed
    db.renderViewEntries(userCookie.email, res);
});
main.app.get('/reports.ejs', function(req, res){
    res.status(200).render('reports', {
        active: "Reports",
        month: "March",
        year: "2018"
    });
});
// Documentation
main.app.get('/info', function(req, res){
    res.status(200).render('documentation', { active: "User Profile" });
});

// On User Login
main.app.post('/post-login', function(req, res){
    var email = req.body.email;
    var pass = req.body.pass;
    db.login(email, pass, res);
});
// On User Signup
main.app.post('/post-signup', function(req, res){
    var fName = req.body.fName;
    var lName = req.body.lName;
    var email = req.body.email;
    var pass = req.body.pass;
    db.signup(fName, lName, email, pass, res);
});

// Create entry
main.app.post('/post-add-entry', function(req, res){
    var body = req.body; // Get body of request
    var email = body.email;
    var day = body.day;
    var month = body.month;
    var year = body.year;
    var ie = body.ie;
    var amount = body.amount;
    var mop = body.mop;
    var desc = body.desc;
    var type = body.type;
    var country = body.country;
    var company = body.company;
    db.createEntry(email, day, month, year, ie, amount, mop, desc, type, country, company, res);
});
// Create credit card payment entry
main.app.post('/post-add-credit-entry', function(req, res){
    var body = req.body; // Get body of request
    var email = body.email;
    var day = body.day;
    var month = body.month;
    var year = body.year;
    var amount = body.amount;
    var mop = body.mop;
    var cc = body.cc;
    var dayStart = body.dayStart;
    var monthStart = body.monthStart;
    var yearStart = body.yearStart;
    var dayEnd = body.dayEnd;
    var monthEnd = body.monthEnd;
    var yearEnd = body.yearEnd;
    // ***** CREATE DB FUNCTION AND EDIT PROPERTIES OF DB (ADD START/END DATE, ...)
    db.createCreditEntry(email, day, month, year, amount, mop, cc, dayStart, monthStart, yearStart, dayEnd, monthEnd,
        yearEnd, res);
});

main.app.listen(7000, function () {
    console.log('Example app listening on 7000');
});
    
    