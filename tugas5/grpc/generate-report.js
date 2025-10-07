const fs = require('fs');
const { generateReport } = require('k6-html-reporter');

const jsonFile = 'output.json';
const htmlFile = 'report.html';

// Read the NDJSON file
const lines = fs.readFileSync(jsonFile, 'utf-8')
                .split('\n')
                .filter(line => line.trim() !== '');

// Parse each line into an object
const data = lines.map(line => JSON.parse(line));

// Generate the HTML report
const html = generateReport(data);

// Write the HTML report to a file
fs.writeFileSync(htmlFile, html);
console.log(`HTML report has been generated at ${htmlFile}`);
