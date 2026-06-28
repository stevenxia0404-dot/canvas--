const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        LevelFormat } = require('docx');

const md = fs.readFileSync(process.argv[2], 'utf8');
const lines = md.split('\n');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };

function makeCell(text, bold, shading, width) {
  return new TableCell({
    borders,
    width: { size: width || 2000, type: WidthType.DXA },
    shading: shading ? { fill: shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold, font: "Arial", size: 20 })] })]
  });
}

function parseRuns(txt) {
  const runs = [];
  let j = 0;
  while (j < txt.length) {
    if (txt[j] === '*' && txt[j+1] === '*') {
      const end = txt.indexOf('**', j+2);
      if (end > 0) { runs.push(new TextRun({ text: txt.slice(j+2, end), bold: true, font: "Arial", size: 22 })); j = end + 2; continue; }
    }
    if (txt[j] === '`') {
      const end = txt.indexOf('`', j+1);
      if (end > 0) { runs.push(new TextRun({ text: txt.slice(j+1, end), font: "Courier New", size: 20, color: "e06c75" })); j = end + 1; continue; }
    }
    if (txt[j] === '[') {
      const endB = txt.indexOf(']', j+1);
      const startP = txt.indexOf('(', endB > 0 ? endB : j);
      if (endB > 0 && startP === endB + 1) {
        const endP = txt.indexOf(')', startP);
        if (endP > 0) {
          runs.push(new TextRun({ text: txt.slice(j+1, endB), font: "Arial", size: 22, color: "56b6c2", underline: {} }));
          j = endP + 1; continue;
        }
      }
    }
    runs.push(new TextRun({ text: txt[j], font: "Arial", size: 22 }));
    j++;
  }
  return runs;
}

const children = [];
let i = 0;
let inTable = false, tableRows = [], tableCols = 0;
let inCodeBlock = false, codeLines = [];

while (i < lines.length) {
  const line = lines[i];

  // Code block
  if (line.trim().startsWith('```') && !inCodeBlock) {
    inCodeBlock = true; codeLines = []; i++; continue;
  }
  if (line.trim().startsWith('```') && inCodeBlock) {
    inCodeBlock = false;
    if (codeLines.length) {
      children.push(new Paragraph({
        spacing: { before: 120, after: 120 },
        shading: { fill: "1e222a", type: ShadingType.CLEAR },
        children: [new TextRun({ text: codeLines.join('\n'), font: "Courier New", size: 16, color: "abb2bf" })]
      }));
    }
    i++; continue;
  }
  if (inCodeBlock) { codeLines.push(line); i++; continue; }

  // Separator
  if (line.trim() === '---') { i++; continue; }

  // Table detection
  if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
    if (!inTable) { inTable = true; tableRows = []; }
    if (line.includes('---')) { i++; continue; } // skip separator row
    const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
    tableCols = Math.max(tableCols, cells.length);
    tableRows.push(cells);
    i++;
    if (i >= lines.length || !lines[i].trim().startsWith('|')) {
      // End table, flush
      const colW = Math.floor(9000 / tableCols);
      children.push(new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: Array(tableCols).fill(colW),
        rows: tableRows.map((row, ri) => new TableRow({
          children: row.map(cell => makeCell(cell, ri === 0, ri === 0 ? "D5E8F0" : undefined, colW))
        }))
      }));
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      inTable = false; tableRows = []; tableCols = 0;
    }
    continue;
  }

  // H1
  if (line.startsWith('# ') && !line.startsWith('## ')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 200 },
      children: [new TextRun({ text: line.slice(2), bold: true, font: "Arial", size: 36, color: "1c1c1c" })]
    }));
    i++; continue;
  }

  // H2
  if (line.startsWith('## ') && !line.startsWith('### ')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 160 },
      children: [new TextRun({ text: line.slice(3), bold: true, font: "Arial", size: 30, color: "333333" })]
    }));
    i++; continue;
  }

  // H3
  if (line.startsWith('### ')) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 120 },
      children: [new TextRun({ text: line.slice(4), bold: true, font: "Arial", size: 26, color: "555555" })]
    }));
    i++; continue;
  }

  // List items
  if (line.trim().startsWith('- ')) {
    const txt = line.trim().slice(2);
    const runs = [];
    // Parse **bold** and `code`
    let j = 0;
    while (j < txt.length) {
      if (txt[j] === '*' && txt[j+1] === '*') {
        const end = txt.indexOf('**', j+2);
        if (end > 0) { runs.push(new TextRun({ text: txt.slice(j+2, end), bold: true, font: "Arial", size: 22 })); j = end + 2; continue; }
      }
      if (txt[j] === '`') {
        const end = txt.indexOf('`', j+1);
        if (end > 0) { runs.push(new TextRun({ text: txt.slice(j+1, end), font: "Courier New", size: 20, color: "e06c75" })); j = end + 1; continue; }
      }
      runs.push(new TextRun({ text: txt[j], font: "Arial", size: 22 }));
      j++;
    }
    children.push(new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: { left: 720 },
      children: [new TextRun({ text: "• ", font: "Arial", size: 22 }), ...runs]
    }));
    i++; continue;
  }

  // Sub-list (indented dash)
  if (line.trim().startsWith('  - ')) {
    const txt = line.trim().slice(2);
    const runs = parseRuns(txt);
    children.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      indent: { left: 1440 },
      children: [new TextRun({ text: "• ", font: "Arial", size: 20 }), ...runs]
    }));
    i++; continue;
  }

  // Empty line
  if (!line.trim()) { i++; continue; }

  // Regular paragraph
  const runs = parseRuns(line.trim());
  if (runs.length) {
    children.push(new Paragraph({
      spacing: { before: 60, after: 60 },
      children: runs
    }));
  }
  i++;
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1c1c1c" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "555555" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
      }
    },
    children
  }]
});

const outPath = process.argv[3] || process.argv[2].replace('.md', '.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('Done: ' + outPath);
}).catch(e => console.error(e));
