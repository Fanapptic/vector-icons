/*
 * RUN: npm run build
 */

const fs = require('fs');

const fontFiles = fs.readdirSync('../fonts');
let htmlDocsStylesheets = '';
let htmlDocsContent = '';

fontFiles.forEach(fontFile => {
  const fontDirectory = 'fonts';
  const fontFamily = fontFile.replace('.ttf', '');
  const glyphMap = require(`../glyphmaps/${fontFamily}.json`);
  let scss = '';
  let css = '';

  htmlDocsContent += `<h1>${fontFamily}</h1>`;
  htmlDocsStylesheets += `<link href="${fontFamily}.css" rel="stylesheet" type="text/css" />`;

  // Set scss variables
  scss += `
    $${fontFamily.toLowerCase()}-font-path: "${fontDirectory}" !default;
  `;

  // Generate @font-face
  scss += `@font-face {
    font-family: "${fontFamily}";
    src:url("#{$${fontFamily.toLowerCase()}-font-path}/${fontFamily}.ttf") format("truetype");
  }\n`;

  css += `@font-face {
    font-family: "${fontFamily}";
    src:url("${fontDirectory}/${fontFamily}.ttf") format("truetype");
  }\n`;

  // Generate icon classes with baseline properties, specific glyph and docs html content.
  let glyphSelectors = [];

  Object.keys(glyphMap).forEach(glyphMapKey => {
    const glyphClass = `${fontFamily.toLowerCase()}-${glyphMapKey}`;
    const glyphSelector = `.${glyphClass}:before`;
    const glyphRuleset = `${glyphSelector} {
      content: "${String.fromCharCode(glyphMap[glyphMapKey])}"
    }\n`;

    scss += glyphRuleset;
    css += glyphRuleset;

    htmlDocsContent += `<div><i class="${glyphClass}"></i><span>.${glyphClass}</span></div>`;

    glyphSelectors.push(glyphSelector);
  });

  const glyphGlobalRuleset = glyphSelectors.join(',') + ' ' + `{
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

  scss += glyphGlobalRuleset;
  css += glyphGlobalRuleset;

  // Copy font file to docs directory
  fs.createReadStream(`../fonts/${fontFile}`).pipe(fs.createWriteStream(`../docs/fonts/${fontFile}`));

  // Write scss and css file
  fs.writeFileSync(`../scss/${fontFamily}.scss`, scss);
  fs.writeFileSync(`../css/${fontFamily}.css`, css);
  fs.writeFileSync(`../docs/${fontFamily}.css`, css);
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
