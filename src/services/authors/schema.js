import mongoose from "mongoose"

import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    avatar: String,
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    googleId: { type: String },
  },

  {
    timestamps: true,
  }
)

AuthorSchema.pre("save", async function (next) {
  const newAuthor = this
  const plainPw = newAuthor.password

  if (newAuthor.isModified("password")) {
    const hash = await bcrypt.hash(plainPw, 10)
    newAuthor.password = hash
  }

  next()
})

AuthorSchema.methods.toJSON = function () {
  const authorDocument = this
  const authorObject = authorDocument.toObject()

  delete authorObject.password
  delete authorObject.__v

  return authorObject
}

AuthorSchema.statics.checkCredentials = async function (email, plainPW) {
  const author = await this.findOne({ email })
  if (author) {
    const isMatch = await bcrypt.compare(plainPW, author.password)

    if (isMatch) {
      return author
    } else {
      return null
    }
  } else {
    return null
  }
}
export default model("Author", AuthorSchema)
