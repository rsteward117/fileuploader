const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require("../passport");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const path = require("path");
require('dotenv').config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { title } = require("process");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
        
//     }
// })

exports.index = asyncHandler(async (req, res, next) => {
    const getFolders = await prisma.folder.findMany({
        where: {
            userId: req.user.id
        },
        include: {
            file: true,
        },
    });

    res.render('index', {
        title: "file uploader Home",
        folders: getFolders,
    })
})

exports.create_folder_get = asyncHandler(async (req, res, next) => {
    res.render('folderform', {
        title: "create a folder",
    }) 
})

exports.create_folder_post= [
    body("foldername", "your folder name must not be empty.")
    .trim()
    .isLength({min: 1})
    .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            // There are errors. Render form again with sanitized values/error messages.
            res.render('folderform', {
                title: "create a folder",
                errors: errors.array(),
            });
        } else{
            await prisma.folder.create({
                data:{
                    name: req.body.foldername,
                    userId: req.user.id,
                },
            });
            res.redirect("/")
        }
    }),
];

exports.folder_get = asyncHandler(async (req, res, next) => {
    const getfolder = await prisma.folder.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
    });
    if(!getfolder){
        return res.status(404).send("folder not found")
    }
    const getFolderFiles = await prisma.file.findMany({
        where:{
            folderId: parseInt(getfolder.id)
        }
    })
    res.render('folder', {
        title: getfolder.name,
        folder: getfolder,
        files: getFolderFiles,
    }) 
})

exports.file_get = asyncHandler(async (req, res, next) => {
    const fileId = parseInt(req.params.id, 10);

    const getFile = await prisma.file.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
        include: {
            folder: true,
        },
    });

    if(!getFile){
        return res.status(404).send("file not found")
    }

    res.render('file', {
        title: getFile.filename,
        file: getFile,
    })
})

exports.folder_delete = asyncHandler(async (req, res, next)=>{
    const folderfiles = await prisma.file.findMany({
        where: {
            folderId: parseInt(req.params.id),
        },
    });

    if(folderfiles.length > 0){
        const publicIds = folderfiles.map((file) => {
            const publicid = file.path.split("/").pop().split('.')[0];
            return publicid;
        });

        await cloudinary.api.delete_resources(publicIds);
        console.log('all files has been deleted from cloudinary')

        await prisma.file.deleteMany({
            where: {
                folderId: parseInt(req.params.id),
            },
        });
    }

    await prisma.folder.delete({
        where: {
            id: parseInt(req.params.id),
        },
    })
    res.redirect("/");
})

exports.file_delete = asyncHandler(async (req, res, next) => {
    const file = await prisma.file.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
    });

    const publicid = file.path.split("/").pop().split(".")[0]; 
    
    await cloudinary.api.delete_all_resources(publicid);
    console.log("this file has been deleted from cloudinary")

    await prisma.file.delete({
        where: {
            id: parseInt(req.params.id),
        },
    });
    res.redirect("/");
})


exports.uploader_file_post = asyncHandler( async (req, res, next) => {
    const uploadResult = cloudinary.uploader.upload_stream(
        {resource_type: "auto"},
        async(err, result) =>{
            if(err){
                return res.status(500).send("Error trying to upload files.");
            }
            const url = result.secure_url;
            const fileSize = req.file.size
            await prisma.file.create({
                data:{
                    path: url,
                    folderId: parseInt(req.params.id),
                    filename: req.file.originalname,
                    size: fileSize,
                }
            })
            res.redirect("/");
        }
    );
    uploadResult.end(req.file.buffer)
})