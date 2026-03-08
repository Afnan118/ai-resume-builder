const fs = require('fs');
try {
    const pdfMake = require('pdfmake/build/pdfmake');
    const htmlToPdfmake = require('html-to-pdfmake');
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    const { window } = new JSDOM("");
    const { PDFParse } = require('pdf-parse');
    require('pdf-parse/worker');

    const html = `
    <h1 style="font-size: 24px; font-weight: 700; text-transform: uppercase;">John Doe</h1>
    <h2 style="font-size: 16px; font-weight: 700;">Software Engineer</h2>
    <p>Here is my experience text. It must be at least 50 characters so we can extract it properly.</p>
    `;

    const content = htmlToPdfmake(html, { window: window });
    const docDefinition = {
        content: content,
        defaultStyle: { font: 'Helvetica' }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    pdfDocGenerator.getBuffer((buffer) => {
        fs.writeFileSync('test-pdfmake.pdf', buffer);
        console.log("PDF created, length:", buffer.length);

        // Parse the PDF
        const parser = new PDFParse({ data: buffer });
        parser.getText().then(result => {
            console.log("Extracted text length:", result.text.length, "chars");
            console.log("Extracted Snippet:", result.text.slice(0, 100).replace(/\\n/g, ' '));
        }).catch(err => {
            fs.writeFileSync('error.txt', err.stack);
        });
    });
} catch (e) {
    fs.writeFileSync('error.txt', e.stack);
}
