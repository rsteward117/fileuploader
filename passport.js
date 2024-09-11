const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require("passport");
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            //finds a user who's username match the username in the prisma/postgresql database
            const user = await prisma.user.findUnique({where: {username} });
            //compares the password with the bcryptjs hased password from the prisma/postgresql database
            const match = await bcrypt.compare(password, user.password);

            if(!user) {
                return done(null, false, {message: "Incorrect username"});
            }
            if(!match) {
                return done(null, false, {message: "Incorrect password"});
            }
            return done(null, user);
        } catch(err){
            return done(err);
        }
    })
);


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try{
        //gets the authenticated user based on the users id.
        const user = await prisma.user.findUnique({ where: {id}});
        done(null, user);
    } catch(err){
        done(err);
    }
});

module.exports = passport;