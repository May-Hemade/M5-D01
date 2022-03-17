import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import passport from "passport"

import authorsRouter from "./services/authors/index.js"
import blogsRouter from "./services/blogs/index.js"
import filesRouter from "./services/files/index.js"

import { join } from "path"
import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
  forbiddenHandler,
  catchAllHandler,
} from "./errorHandlers.js"
import mongoose from "mongoose"
import googleStrategy from "./auth/oauth.js"

const server = express()

const port = process.env.PORT || 3002

passport.use("google", googleStrategy)

const loggerMiddleware = (req, res, next) => {
  console.log(
    `Request method: ${req.method} --- URL ${req.url} --- ${new Date()}`
  )
  req.name = ""
  next()
}
server.use(loggerMiddleware)
const whiteListedOrigins = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

console.log("Permitted origins:")
console.table(whiteListedOrigins)

passport.use("google", googleStrategy)

server.use(
  cors({
    origin: function (origin, next) {
      console.log("ORIGIN: ", origin)

      if (!origin || whiteListedOrigins.indexOf(origin) !== -1) {
        console.log("YAY!")
        next(null, true)
      } else {
        next(new Error("CORS ERROR!"))
      }
    },
  })
)

server.use(express.json())
server.use(passport.initialize())
server.use("/authors", authorsRouter)
server.use("/blogs", blogsRouter)
// server.use("/files", filesRouter)
console.table(listEndpoints(server))
server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("Server runnning on port: ", port)
  })
})
