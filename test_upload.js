const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  const form = new FormData();
  form.append('file', fs.createReadStream('package.json'));
  
  try {
    const res = await fetch('http://localhost:3000/api/analyze-contract', {
      method: 'POST',
      body: form
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("RESPONSE:", text);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
