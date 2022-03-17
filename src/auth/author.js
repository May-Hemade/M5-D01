import BlogModel from "../services/blogs/schema.js"
import createError from "http-errors"

export const blogAuthorMiddleware = async (req, res, next) => {
  const blogId = req.params.blogId
  const author = req.user
  if (author.role === "Admin") {
    next()
  } else {
    const blog = await BlogModel.findBlogWithAuthor(blogId, author)
    if (blog) {
      next()
    } else {
      next(createError(401, "Unauthorized access"))
    }
  }
}
