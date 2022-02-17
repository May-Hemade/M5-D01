import mongoose from "mongoose"


const { Schema, model } = mongoose

const blogSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: {
        type: Number,
        required: true,
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

export default model("Blog", blogSchema)
