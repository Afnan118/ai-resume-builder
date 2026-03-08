import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

async function test() {
    try {
        const buffer = await readFile('sample.pdf');
        console.log("Creating new PDFParse instance...");
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        console.log('PDF Text:', pdfData.text);
    } catch (err) {
        console.error(err);
    }
}
test();
