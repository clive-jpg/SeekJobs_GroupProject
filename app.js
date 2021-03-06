require("dotenv").config();

//Import Libraries
const { urlencoded } = require("express");
const express = require("express");
const { engine } = require("express-handlebars");

//Import required modules
const fs = require("fs");
const path = require("path");
const passport = require("passport");
const bcrypt = require("bcrypt");

//In-built modules (filesystem and path)
const app = express();
const config = require("./config.json").development;

// Set up pg connection with knex
const knexConfig = require("./db/knexfile").development;
const knex = require("knex")(knexConfig);

//setup applications
const AppRouter = require("./Routers/AppRouter");
const JobService = require("./Services/JobServices");
const credService = require("./Services/CredService");

//setup AuthRouter & ViewRouter
const AuthRouter = require("./Routers/authRouter");
const authRouter = new AuthRouter();
const ViewRouter = require("./Routers/viewRouter");
const viewRouter = new ViewRouter(knex, express);

/** **************** Configure Express *********************** */
//Setup Handlebars
app.set("view engine", "hbs");
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`,
  })
);

//Setup Express middlewares
app.use(express.static("public"));
app.use(urlencoded({ extended: true }));
app.use(express.json());

//Setup Auth (***** To Be Done *******)
const passportFunctions = require("./passport");
const expressSession = require("express-session");
const isLoggedIn = require("./authFunctions/auth").isLoggedIn;

app.use(
  // Creating a new session generates a new session id, stores that in a session cookie, and
  expressSession({
    secret: "secret",
    // save the user
    // if false, will not save session to browser
    resave: true,
    // if saveUninitialized is false, session object will not be stored in sesion store
    saveUninitialized: true,
  })
);

// Setup Local Login
app.use(passportFunctions.initialize());
app.use(passportFunctions.session());

/** **************** Configure Job Services *********************** */
//Render user homepage
app.get("/", (req, res) => {
  res.render("index", {
    authenticated: req.isAuthenticated(),
    username: req.isAuthenticated() && req.user.username,
  });
  //
});

//Render job board
app.get("/searchJobs", (req, res) => {
  res.render("searchJobs");
});

// //Render user login page
app.get("/login", (req, res) => {
  res.render("login");

});

//Render Register page
app.get("/register", (req, res) => {
  res.render("register")
})


app.get("/user", (req, res) => {
  res.render("user", {
    authenticated: req.isAuthenticated(),
    username: req.isAuthenticated() && req.user.username,
    // username: "Clive",
    first_name: req.isAuthenticated() && req.user.first_name,
    
  });
  });


//Render user application status page

//Render biz login ?? Does it need to be separated with the user login?
app.get("/employerlogin", (req, res) => {
  res.render("employerLogin");
});

//Render biz add job page
app.get("/addjob", (req, res) => {
  res.render("addJob");
});

//Render biz profile
app.get("/employer/:employerName", (req, res) => {
  res.render("employerProfile");
});


/** **************** Configure Router *********************** */
app.use("/api", new AppRouter(JobService, express, knex).router());
app.use("/", authRouter.router());
app.use("/", viewRouter.router());

//Render Error Page
app.get("/usererror", (req, res) => {
  res.status(404);
  //console.log(`Error 404`);
  res.render("usererror");
}); 

 app.get("*", (req, res) => {
  res.status(404);
  //console.log(`Error 404`);
  res.render("error");
}); 

//setup port
app.listen(config, () => {
  console.log(`Listening to ${config.port}`);
});

// ----------------- route for Search Jobs Page (temporarily) -----------------
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const jobListingData = require('./joblisting');

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.static('public'));

// app.get('/api/joblisting', (req, res) => {
//   res.send(jobListingData);
// });
