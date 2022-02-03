import express from "express"
import multer from "multer"
import {
  getAuthorsReadableStream,
  saveAuthorsAvatar,
} from "../../lib/fs-tools.js"
import { saveBlogsCover } from "../../lib/fs-tools.js"
import json2csv from "json2csv"
import { pipeline } from "stream"

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

filesRouter.get("/downloadAuthors", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv")

    const source = getAuthorsReadableStream()
    const transform = new json2csv.Transform({
      fields: ["name", "surname", "email"],
    })
    const destination = res

    pipeline(source, transform, destination, (err) => {
      if (err) next(err)
    })
  } catch (error) {
    next(error)
  }
})
export default filesRouter
