const fs = require('fs');
const path = require('path');

const pyContent = fs.readFileSync(path.resolve(__dirname, 'create_pages.py'), 'utf8');

// Match keys like "pages/auth/LoginPage.jsx": """..."""
const regex = /"([^"]+\.jsx)":\s*"""([\s\S]*?)"""/g;
let match;
let count = 0;

const baseDir = path.resolve(__dirname, 'client', 'src');

while ((match = regex.exec(pyContent)) !== null) {
  const relPath = match[1];
  const code = match[2];
  const fullPath = path.join(baseDir, relPath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, code.trim() + '\n', 'utf8');
  console.log(`[Extracted & Written] ${relPath}`);
  count++;
}

console.log(`Total extracted files: ${count}`);
