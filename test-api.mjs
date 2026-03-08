import { readFile } from 'fs/promises';

async function test() {
    const fileBuf = await readFile('./sample.pdf');
    const blob = new Blob([fileBuf], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, 'sample.pdf');

    const res = await fetch('http://localhost:3000/api/test-pdf', {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    console.log(data);
}
test();
