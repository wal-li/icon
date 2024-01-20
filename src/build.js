import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { JSDOM } from 'jsdom';
import * as changeCase from 'change-case';
import { join } from 'node:path';
import { Presets, SingleBar } from 'cli-progress';

const data = JSON.parse(readFileSync('./ionicons/src/data.json'));
const template = readFileSync('./src/template.vue').toString();

const searchMap = {
  sharp: '(.*)-sharp$',
  outline: '(.*)-outline$',
  solid: '(.*)'
};
const iconMap = {};
const replaceMap = {
  '\\<\\?xml.*\\?\\>': '',
  '\\<!--.*--\\>': '',
  '#000': 'currentColor'
};

// merge data
for (const item of data.icons) {
  for (const type in searchMap) {
    const res = new RegExp(searchMap[type]).exec(item.name);

    if (!res) continue;

    iconMap[res[1]] ||= [];
    iconMap[res[1]].push({
      name: item.name,
      type
    });
    break;
  }
}

// export icon
if (existsSync('./dist')) rmSync('./dist', { recursive: true });
mkdirSync('./dist');

let indexContent = '';
const bar = new SingleBar({}, Presets.legacy);
bar.start(Object.keys(iconMap).length, 0);
let i = 0;

function replaceTagNotFill(svg, tag) {
  const dom = new JSDOM(svg, { contentType: 'image/svg+xml' });
  const { document } = dom.window;

  // Select all path elements without a fill attribute
  const pathsWithoutFill = document.querySelectorAll(`${tag}:not([fill])`);

  // Add fill="currentColor" to each path without fill attribute
  pathsWithoutFill.forEach((path) => {
    path.setAttribute('fill', 'currentColor');
  });

  // Serialize the modified SVG back to a string
  svg = dom.serialize();

  return svg;
}

for (const name in iconMap) {
  i++;
  bar.update(i);

  let content = template;
  for (const item of iconMap[name]) {
    let svg = readFileSync(
      join('./ionicons/src/svg/', item.name + '.svg')
    ).toString();

    // regex replace
    for (const replReg in replaceMap) {
      svg = svg.replace(new RegExp(replReg, 'gm'), replaceMap[replReg]);
    }

    // attr replace
    svg = replaceTagNotFill(svg, 'path');
    svg = replaceTagNotFill(svg, 'rect');
    svg = replaceTagNotFill(svg, 'circle');
    svg = replaceTagNotFill(svg, 'polygon');
    svg = replaceTagNotFill(svg, 'ellipse');

    content = content.replace(`<!-- ${item.type} -->`, svg);
  }

  const filename = changeCase.pascalCase(name + '-icon');
  writeFileSync(join('./dist', filename + '.vue'), content);

  indexContent += `export { default as ${filename} } from "./${filename}.vue";\n`;
}

bar.stop();

writeFileSync('./dist/index.js', indexContent);
