import mongoose from "mongoose"

const { Schema, model } = mongoose

const blogSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String },
    readTime: {
      value: {
        type: Number,
      },
      unit: String,
    },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    comments: [
      {
        _id: { type: String },
        comment: { type: String },
        rate: { type: Number },
      },
    ],

    likes: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },

  {
    timestamps: true,
  }
)

blogSchema.static("findBlogsWithAuthors", async function (mongoQuery) {
  const total = await this.countDocuments(mongoQuery.criteria)
  const blogs = await this.find(mongoQuery.criteria)
    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort)
    .populate({
      path: "authors",
      select: "name avatar",
    })
  return { total, blogs }
})

blogSchema.statics.findBlogWithAuthor = async function (blogId, author) {
  const blog = await this.findOne({ _id: blogId })

  if (blog) {
    const isMatch = blog.authors.includes(author._id)
    if (isMatch) {
      return blog
    } else {
      return null
    }
  } else {
    return null
  }
}

export default model("Blog", blogSchema)
