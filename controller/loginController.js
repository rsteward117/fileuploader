const { body, validationResult } = require("express-validator");
const passport = require("../passport");
const asyncHandler = require("express-async-handler");

exports.login_get = asyncHandler(async (req, res, next) => {
    res.render('loginform', {title: "Login"});
});

exports.login_post = [
    body("username", "your username must not be empty.")
    .trim()
    .isLength({min: 1})
    .escape(),
    body("password", "your password must not be empty.")
    .trim()
    .isLength({min: 1})
    .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            // There are errors. Render form again with sanitized values/error messages.
            res.render('loginform', {
                title: "Login",
                errors: errors.array(),
            });
        }
        next();
    }),
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/auth/login"
    }),
];

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        res.redirect("/auth/login");
    });
};