const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let changedFiles = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // replace the filename inside _aux folder
  let newContent = content.replace(/(_aux\/)aux\./g, "$1_aux.");
  newContent = newContent.replace(/(_aux\/types\/)aux\./g, "$1_aux.");
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${changedFiles} files with _aux filenames`);
