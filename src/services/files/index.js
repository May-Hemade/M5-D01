import express from "express"
import multer from "multer"
import { saveAuthorsAvatar } from "../../lib/fs-tools.js"
import { saveBlogsCover } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

const upload = multer()

filesRouter.post(
  "/uploadSingleAvatar",
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      await saveAuthorsAvatar(req.file.originalname, req.file.buffer)
      res.send("Ok")
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.post(
  "/uploadMultipleAvatars",
  multer().array("avatar"),
  async (req, res, next) => {
    try {
      console.log("file", req.file)
      const arrayOfPRomises = req.file.map((file) =>
        saveAuthorsAvatar(file, originalname, file.buffer)
      )
      await Promise.all(arrayOfPRomises)
      res.send("Ok")
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.post(
  "/uploadSingleCover",
  upload.single("cover"),
  async (req, res, next) => {
    try {
      await saveBlogsCover(req.file.originalname, req.file.buffer)
      res.send("Ok")
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.post(
  "/uploadMultipleCovers",
  upload.array("cover"),
  async (req, res, next) => {
    try {
      console.log("file", req.file)
      const arrayOfPRomises = req.file.map((file) =>
        saveBlogsCover(file, originalname, file.buffer)
      )
      await Promise.all(arrayOfPRomises)
      res.send("Ok")
    } catch (error) {
      next(error)
    }
  }
)
export default filesRouter
