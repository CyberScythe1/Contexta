const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  try {
    const dataBuffer = fs.readFileSync('D:\\\\college\\\\Prodigy95 OS.pdf');
    const data = await pdfParse(dataBuffer);
    console.log("SUCCESS length:", data.text.length);
  } catch(e) {
    console.error("CRASH:", e);
  }
}
test();
