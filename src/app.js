require("dotenv").config();
const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const logger = require("morgan");
const fs = require("fs");
const request = require('request')
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const app = express();
const multer = require("multer");
const auth = require("./backend/controllers/authenticationController");
const admin = require("./backend/controllers/adminController");
const deal = require("./backend/controllers/dealerController");
const Dealer = require("./backend/models/DealerDataModel");
const csv = require("csvtojson");
app.use(cookieParser());
app.use(
  session({
    secret: "MySecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      httpOnly: true,
      secure: false,
      maxAge: null,
    },
  })
);
// Public Folder
app.use(express.static(path.join( __dirname, "/public")));
app.use(cors());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use(logger("dev"));
app.set("port", process.env.PORT || 5000);
const mongodb = require("mongodb");
let mongoose = require("mongoose");

const uri =`mongodb+srv://Tvastra:Sgoc.2030@cluster0.w2dnb.mongodb.net/UserCollection?retryWrites=true&w=majority`;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("DB Connection Established");
  });

// Setting home page routing to login page
app.get("/",  auth.redirectLogin, auth.redirectLogin2);

app.get("/login", (req, res) => {
  res.render("login.ejs",{error: req.session.error, session: req.session, errorType: req.session.errorType });
});

app.get("/register", (req, res) => {
  res.render("register.ejs",{ session: req.session, error :req.session.error, errorType :req.session.errorType});
});
app.post("/register",function(req,res, next){
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    // return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    req.session.error = "Please Fill Recaptcha"
    req.session.errorType = 'Failure';
    res.redirect('/register');
   
  }
  // Put your secret key here.
  var secretKey = "6LcrxY4bAAAAAB5dAc86iH458Um8NiURbotxjzoN";
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      // return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
      req.session.error = "Failed captcha verification"
      req.session.errorType = 'Failure';
      res.render('register.ejs');
    }
    // res.json({"responseCode" : 0,"responseDesc" : "Sucess"});
    next()
  });
}, auth.signUp);
// app.post("/login", auth.login);

app.post('/login',function(req,res, next){
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    // return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    req.session.error = "Please Fill Recaptcha"
    req.session.errorType = 'Failure';
    res.redirect('/login');
 
  }
  // Put your secret key here.
  var secretKey = "6LcrxY4bAAAAAB5dAc86iH458Um8NiURbotxjzoN";
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      // return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
      req.session.error = "Failed captcha verification"
      req.session.errorType = 'Failure';
      res.render('login.ejs');
    }
    // res.json({"responseCode" : 0,"responseDesc" : "Sucess"});
    next()
  });
}, auth.login);






app.get('/logout', (req,res)=>{
  delete req.session.userId;
	delete req.session.user;
	req.session.error = '';
	res.redirect('/login');
})
app.post("/dealers/dealer-data", deal.addDealerData);

app.get("/admin",auth.redirectLogin, auth.redirectLogin2, admin.getUsers, (req, res) => {
  res.render("admin.ejs", { users: res.locals.doc, session: req.session,email1:req.session.user.email,  name:req.session.user.name, error :req.session.error, errorType :req.session.errorType});
  res.end();
});
app.post(`/change-user-role/:id`, admin.changeUserRole )
global.__basedir = __dirname;

// -> Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// -> Express Upload RestAPIs
// Always use name of file input in upload.single(ex. here = 'csvFile')
app.post("/uploadFile", upload.single("csvFile"), (req, res) => {
  console.log(req.file);
  importCsvData2MongoDB(__basedir + "/public/uploads/" + req.file.filename);
 
  res.redirect('/dealers/1')
  
});

// -> Import CSV File to MongoDB database
function importCsvData2MongoDB(filePath) {
  console.log("1 file path is", filePath);
  csv()
    .fromFile(filePath)
    .then((jsonObj) => {
      console.log(jsonObj);

      // Insert Json-Object to MongoDB
      //Don't forget to use collection name and Close() database
      Dealer.insertMany(jsonObj, (err, res) => {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);

      
      });
    });

  // fs.unlinkSync(filePath);
}
// pagination api Get 'page' parameter from browser
app.get("/dealers/filter/:pageN",auth.redirectLogin, auth.redirectLogin2, deal.dealerPagination);

app.get('/delete/:id',auth.redirectLogin, auth.redirectLogin2,(req,res,next)=>{
  // const pageNo = req.params.pageNo;
  // res.locals.pageNo = pageNo;
  // console.log(pageNo);

  const id = req.params.id;
  Dealer.findByIdAndDelete(id,(err, data)=>{
    if(err) throw err;
    console.log(data, "Deleted Successfully");
  
  })
  // console.log(pageNo)
  res.redirect(`/dealers/1`);

})
app.get('/edit-form/:index',auth.redirectLogin, auth.redirectLogin2, deal.editDealerForm)
app.put('/disable-error', auth.clearError);



app.post('/dealers/update-dealer-data/:id',auth.redirectLogin, auth.redirectLogin2, deal.updateData);

app.get('/getAllDealers',auth.redirectLogin, auth.redirectLogin2, deal.getAllDealers )

app.post('/dealers/filter', deal.dealerPagination)
  // res.send({cityFilter, zipFilter, stateFilter, areaFilter})



app.listen(app.get("port"), () => {
  console.log("Application started Listening on ", app.get("port"));
});
