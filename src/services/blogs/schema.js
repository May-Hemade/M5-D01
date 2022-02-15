import mongoose from "mongoose"

const { Schema, model } = mongoose

const blogSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime:{
        value:{
          type:Number,
          required:true
    },
        unit: String
    },
    author: {
      name: { type: String, required: true },
      avatar: String
    },
  },
  {
    timestamps: true, // adds and manages automatically createdAt and updatedAt fields
  }
)

export default model("Blog", blogSchema) 