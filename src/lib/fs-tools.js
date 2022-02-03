import fs from "fs-extra"
import { fileURLToPath } from "url"
import { join, dirname } from "path"

const { readJSON, writeJSON, writeFile, createReadStream } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const blogsPublicFolderPath = join(process.cwd(), "./public/img/blogs")
const authorsPublicFolderPath = join(process.cwd(), "./public/img/authors")

const blogsJSONPath = join(dataFolderPath, "blogs.json")
const authorsJSONPath = join(dataFolderPath, "authors.json")

export const getAuthors = () => readJSON(authorsJSONPath)
export const writeAuthors = (content) => writeJSON(authorsJSONPath, content)
export const getBlogs = () => readJSON(blogsJSONPath)
export const writeBlogs = (content) => writeJSON(blogsJSONPath, content)

export const saveAuthorsAvatar = (filename, contentAsABuffer) =>
  writeFile(join(authorsPublicFolderPath, filename), contentAsABuffer)

export const saveBlogsCover = (filename, contentAsABuffer) =>
  writeFile(join(blogsPublicFolderPath, filename), contentAsABuffer)

export const getAuthorsReadableStream = () => createReadStream(authorsJSONPath)
