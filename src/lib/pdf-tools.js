import PdfPrinter from "pdfmake"
import htmlToPdfmake from "html-to-pdfmake"

// import pdfFonts from "pdfmake/build/vfs_fonts"

import { JSDOM } from "jsdom"
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
