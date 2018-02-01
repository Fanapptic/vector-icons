/*
 * RUN: npm run build
 */

const fs = require('fs');

const fontFiles = fs.readdirSync('../fonts');
let htmlDocsStylesheets = '';
let htmlDocsContent = '';

fontFiles.forEach(fontFile => {
  const fontFamily = fontFile.replace('.ttf', '');
  const glyphMap = require(`../glyphmaps/${fontFamily}.json`);

  htmlDocsContent += `<h1>${fontFamily}</h1>`;
  htmlDocsStylesheets += `<link href="${fontFamily}.css" rel="stylesheet" type="text/css" />`;

  // Generate @font-face
  let scss = `@font-face {
    font-family: "${fontFamily}";
    src:url("fonts/${fontFamily}.ttf") format("truetype");
  }\n`;

  // Generate icon classes with baseline properties, specific glyph and docs html content.
  let glyphSelectors = [];

  Object.keys(glyphMap).forEach(glyphMapKey => {
    const glyphClass = `${fontFamily.toLowerCase()}-${glyphMapKey}`;
    const glyphSelector = `.${glyphClass}:before`;

    scss += `${glyphSelector} {
      content: "${String.fromCharCode(glyphMap[glyphMapKey])}"
    }\n`

    htmlDocsContent += `<div><i class="${glyphClass}"></i><span>.${glyphClass}</span></div>`;

    glyphSelectors.push(glyphSelector);
  });

  scss += glyphSelectors.join(',') + ' ' + `{
    display: inline-block;
    font-family: "${fontFamily}";
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    text-rendering: auto;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -mox-osx-font-smoothing: grayscale;
  }\n`;

  // Copy font file to docs directory
  fs.createReadStream(`../fonts/${fontFile}`).pipe(fs.createWriteStream(`../docs/fonts/${fontFile}`));

  // Write scss and css file
  fs.writeFileSync(`../sass/${fontFamily}.scss`, scss);
  fs.writeFileSync(`../css/${fontFamily}.css`, scss);
  fs.writeFileSync(`../docs/${fontFamily}.css`, scss);
});

// Write docs file
fs.writeFileSync('../docs/index.html', `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">

      <title>Vector Icons Examples</title>

      <link href="main.css" rel="stylesheet" type="text/css" />
      ${htmlDocsStylesheets}
    </head>

    <body>
      ${htmlDocsContent}
    </body>
  </html>
`);
