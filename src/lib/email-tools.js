import sgMail from "@sendgrid/mail"
import { generatePdf } from "./pdf-tools.js"
import fs from "fs-extra"

sgMail.setApiKey(process.env.SENDGRID_KEY)

export const sendBlogEmail = async (blog) => {
  const pdf = await generatePdf(blog)
  const attachment = fs.readFileSync(pdf).toString("base64")

  const msg = {
    to: blog.author.email,
    from: process.env.SENDER_EMAIL,
    subject: "New Blog ",
    text: "Hey a new blog has been created",
    html: "<strong>please check it out </strong>",
    html: `<a href="${process.env.FE_PROD_URL}/blog/${blog.id}">click me </a>`,
    attachments: [
      {
        filename: "Report.pdf",
        content: attachment,
        type: "application/pdf",
        disposition: "attachment",
        contentId: blog.id,
      },
    ],
  }

  await sgMail.send(msg)
}
