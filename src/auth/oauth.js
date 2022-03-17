import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import AuthorModel from "../services/authors/schema.js"
import { authenticateUser } from "./tools.js"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/authors/googleRedirect`,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      console.log(profile)

      const user = await AuthorModel.findOne({
        email: profile.emails[0].value,
      })

      if (user) {
        const token = await authenticateUser(user)

        passportNext(null, { token, role: user.role })
      } else {
        const newUser = new AuthorModel({
          name: profile.name.givenName,

          email: profile.emails[0].value,
          googleId: profile.id,
        })

        const savedUser = await newUser.save()
        const token = await authenticateUser(savedUser)

        passportNext(null, { token })
      }
    } catch (error) {
      passportNext(error)
    }
  }
)

passport.serializeUser((data, passportNext) => {
  passportNext(null, data)
})

export default googleStrategy
