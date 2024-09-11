var express = require('express');
const path = require("node:path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./passport");
const fileuploadRouter = require("./routes/fileupload");
const authRouter = require("./routes/auth");
require('dotenv').config();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const {PrismaSessionStore} = require("@quixo3/prisma-session-store");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(
    session({
      cookie: {
       maxAge: 7 * 24 * 60 * 60 * 1000 // ms
      },
      secret: process.env.secret,
      resave: true,
      saveUninitialized: true,
      store: new PrismaSessionStore(new PrismaClient(),{
          checkPeriod: 2 * 60 * 1000,  //ms
          dbRecordIdIsSessionId: true,
          dbRecordIdFunction: undefined,
        }
      )
    })
  );
app.use(passport.session());

//this is middleware that allows me to access the local variable from passport which is "user", and pass it through "currentuser" in my views.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
  });




app.use("/", fileuploadRouter);
app.use("/auth", authRouter);

const PORT = 3000;
app.listen(PORT, ()=> console.log(`server listening on ${PORT}`));