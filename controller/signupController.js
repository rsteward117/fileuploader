const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


exports.signup_get = asyncHandler(async (req, res, next) => {
    res.render('signupform', {title: "sign up now"});
});

exports.signup_post = [
    //validate the fields
    body("username", "your username must not be empty.")
    .trim()
    .isLength({min: 1})
    .escape()
    .custom(async (val) =>{
        const user = await prisma.user.findUnique({where: {username: val} });
        if(user){
            throw new Error("that user already exist!")
        }
    }),
    body("password", "your password must not be empty.")
    .trim()
    .isLength({min: 1})
    .escape(),
    body("cpassword")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("confirm password must not be empty.")
    .custom((val, {req}) =>{
        return val === req.body.password;
    })
    .withMessage("confirm password must match password."),

    asyncHandler(async (req, res, next) =>{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.render('signupform', {
                title: "sign up now",
                errors: errors.array(),
            });

        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await prisma.user.create({
                data: {
                    username: req.body.username,
                    password: hashedPassword,
                },
            });
            res.redirect("/auth/login")
        }
    }),
];