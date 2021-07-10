require("dotenv").config();
const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const logger = require("morgan");
const fs = require("fs");
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

const uri =`${process.env.MONGO_URI}`;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("DB Connection Established");
  });

// Setting home page routing to login page
app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.post("/register", auth.signUp);
app.post("/login", auth.login);

app.post("/dealers/dealer-data", deal.addDealerData);

app.get("/admin", admin.getUsers, (req, res) => {
  res.render("admin.ejs", { users: res.locals.doc, session: req.session });
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
app.get("/dealers/:pageN", deal.dealerPagination);

app.get('/delete/:id',(req,res,next)=>{
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
app.get('/edit-form/:index', deal.editDealerForm)

app.post('/dealers/update-dealer-data/:id', deal.updateData)
app.listen(app.get("port"), () => {
  console.log("Application started Listening on ", app.get("port"));
});
