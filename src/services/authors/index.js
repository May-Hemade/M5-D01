import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"

const authorsRouter = express.Router()

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(currentFilePath)

const authorsJSONPath = join(parentFolderPath, "authors.json")

authorsRouter.get("/", (req, res) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  res.status(200).send(authorsArray)
})
authorsRouter.get("/:authorId", (req, res) => {
  const authorId = req.params.authorId
  console.log("ID: ", authorId)
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  const foundAuthor = authorsArray.find((author) => author.ID === authorId)
  console.log(foundAuthor)
  if (!foundAuthor) {
    res.status(404).send({ message: "Author Not Found" })
  } else {
    res.status(200).send(foundAuthor)
  }
})

authorsRouter.post("/", (req, res) => {
  console.log("REQUEST BODY:", req.body)
  const newAuthor = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    ID: uniqid(),
  }

  const authorArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  authorArray.push(newAuthor)
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorArray))
  res.status(201).send({ ID: newAuthor.ID })
})

authorsRouter.put("/:authorId", (req, res) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  const authorId = req.params.authorId
  const index = authorsArray.findIndex((author) => author.ID === authorId)
  const oldAuthor = authorsArray[index]
  const updatedAuthor = { ...oldAuthor, ...req.body, updatedAt: new Date() }
  authorsArray[index] = updatedAuthor
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray))
  res.status(200).send(updatedAuthor)
})

authorsRouter.delete("/:authorId", (req, res) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  const authorId = req.params.authorId
  const remainingAuthors = authorsArray.filter(
    (author) => author.ID !== authorId
  )
  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))
  res.status(204).send()
})

authorsRouter.post("/checkEmail", (req, res) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
  const email = req.body.email
  console.log(email)
  const index = authorsArray.findIndex((author) => author.email == email)
  //   const emailFound = authorsArray.includes((author) => author.email == email)
  res.status(200).send({ exists: index >= 0 })
})

export default authorsRouter
