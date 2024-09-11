const express = require("express");
const router = express.Router();
const isAuth = require("../isAuth");
const fileuploadController = require("../controller/fileuploadController");
const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

router.get("/", fileuploadController.index);

router.get("/create/folder", fileuploadController.create_folder_get);
router.post("/create/folder", isAuth, fileuploadController.create_folder_post);
router.get("/folder/:id", fileuploadController.folder_get);
router.get("/file/:id", fileuploadController.file_get);
router.post("/folder/delete/:id", isAuth, fileuploadController.folder_delete);
router.post("/file/delete/:id", isAuth, fileuploadController.file_delete);
router.post("/folder/:id", isAuth, upload.single("file"), fileuploadController.uploader_file_post)
module.exports = router;