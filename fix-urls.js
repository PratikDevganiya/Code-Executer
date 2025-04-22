const fs = require('fs');
const path = require('path');

// Function to walk through a directory and process files
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Extensions to check (add more if needed)
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Paths to replace
const replacements = [
  { from: 'http://localhost:5001/api', to: '/api' },
  { from: 'http://localhost:5001', to: '' },
  { from: 'http://localhost:5173', to: '' },
  { from: 'http://localhost:3000', to: '' },
  { from: 'baseURL: "http://localhost:5001/api"', to: 'baseURL: import.meta.env.VITE_API_URL || "/api"' },
  { from: 'const baseURL = "http://localhost:5001/api";', to: 'const baseURL = import.meta.env.VITE_API_URL || "/api";' },
];

// Directories to search
const directories = [
  path.join(__dirname, 'client', 'src')
];

console.log('Starting URL fix process...');

// Process each directory
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  console.log(`Checking directory: ${dir}`);
  
  let filesChecked = 0;
  let filesModified = 0;
  
  // Walk through the directory
  walkDir(dir, filePath => {
    // Check if it's a file we want to process
    const ext = path.extname(filePath).toLowerCase();
    if (!extensions.includes(ext)) return;
    
    filesChecked++;
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let didChange = false;
    
    // Apply all replacements
    replacements.forEach(({from, to}) => {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        didChange = true;
        console.log(`Found "${from}" in ${filePath}`);
      }
    });
    
    // If content was modified, write it back
    if (didChange) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(`Modified: ${filePath}`);
    }
  });
  
  console.log(`Checked ${filesChecked} files, modified ${filesModified} files in ${dir}`);
});

console.log('URL fix process completed!');