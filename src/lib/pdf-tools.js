import PdfPrinter from "pdfmake"
import htmlToPdfmake from "html-to-pdfmake"
import fs from "fs-extra"
import { pipeline } from "stream"
import { promisify } from "util"

// import pdfFonts from "pdfmake/build/vfs_fonts"

import { JSDOM } from "jsdom"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
const { window } = new JSDOM("")

export const getPDFReadableStream = (blog) => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Italics",
    },
  }

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [
      {
        text: blog.title,
        style: "header",
      },
      htmlToPdfmake(blog.content, { window: window }),
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 15,
        bold: true,
      },
      quote: {
        italics: true,
      },
      small: {
        fontSize: 8,
      },
    },
    defaultStyle: {
      font: "Helvetica",
    },
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}
export const generatePdf = async (blog) => {
  const pdfReadableStream = getPDFReadableStream(blog)

  const asyncPipeline = promisify(pipeline)

  const pdfPath = join(
    dirname(fileURLToPath(import.meta.url)),
    `${blog.id}.pdf`
  )
  await asyncPipeline(pdfReadableStream, fs.createWriteStream(pdfPath))

  return pdfPath
}
