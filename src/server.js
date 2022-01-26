import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"

import authorsRouter from "./services/authors/index.js"
import blogsRouter from "./services/blogs/index.js"
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js"
import createHttpError from "http-errors"

const server = express()
const port = 3001

const loggerMiddleware = (req, res, next) => {
  console.log(
    `Request method: ${req.method} --- URL ${req.url} --- ${new Date()}`
  )
  req.name = ""
  next()
}

server.use(loggerMiddleware)
server.use(cors())

server.use(express.json())
server.use("/authors", loggerMiddleware, authorsRouter)
server.use("/blogs", blogsRouter)
console.table(listEndpoints(server))
server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)
server.listen(port, () => {
  console.log(`server is running on port ${port}`)
})
