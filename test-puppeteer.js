const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const { PDFParse } = require('pdf-parse');
require('pdf-parse/worker');

async function run() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const html = await fs.readFile('test.html', 'utf8');
    await page.setContent(html);

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; width: 100%; text-align: right; padding-right: 20px;">-- <span class="pageNumber"></span> of <span class="totalPages"></span> --</div>',
        footerTemplate: '<div></div>',
        margin: { top: '20mm', right: '10mm', bottom: '20mm', left: '10mm' }
    });
    await browser.close();

    console.log("PDF created, length:", pdfBuffer.length);
    await fs.writeFile('test-generated.pdf', pdfBuffer);

    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();

    console.log("Extracted text length:", result.text.length, "chars");
    console.log("Extracted Snippet:", result.text.slice(0, 50).replace(/\\n/g, ' '));
}

run().catch(console.error);
