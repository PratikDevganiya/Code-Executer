const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('='.repeat(50));
console.log('TESTING CLIENT BUILD PROCESS');
console.log('='.repeat(50));

// Utilities
const runCommand = (cmd, cwd = process.cwd()) => {
  console.log(`\n> ${cmd}\n`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing ${cmd}:`, error.message);
    return false;
  }
};

// Change to client directory
process.chdir('client');
console.log(`Current directory: ${process.cwd()}`);

// Clean dist directory if it exists
if (fs.existsSync('dist')) {
  console.log('Cleaning existing dist directory...');
  fs.rmSync('dist', { recursive: true, force: true });
}

// Install dependencies
console.log('\nInstalling client dependencies...');
if (!runCommand('npm install')) {
  console.error('Failed to install client dependencies');
  process.exit(1);
}

// Run build with NODE_OPTIONS
console.log('\nBuilding client...');
const buildSuccess = runCommand('export NODE_OPTIONS="--no-experimental-fetch --openssl-legacy-provider" && npm run build');

if (buildSuccess) {
  console.log('\n✅ Client build successful!');
  
  // List build output
  console.log('\nBuild output:');
  if (fs.existsSync('dist')) {
    runCommand('ls -la dist/');
    
    // Check if index.html exists
    if (fs.existsSync('dist/index.html')) {
      console.log('\nindex.html found in dist directory');
      
      // Check file content to see if it's a proper React build
      const indexContent = fs.readFileSync('dist/index.html', 'utf8');
      if (indexContent.includes('<script') && (indexContent.includes('<link rel="stylesheet"') || indexContent.includes('assets/'))) {
        console.log('✅ index.html contains proper build references');
      } else {
        console.log('⚠️ index.html might not be properly configured with asset references');
        console.log('First 500 characters of index.html:');
        console.log(indexContent.substring(0, 500));
      }
    } else {
      console.error('❌ index.html not found in dist directory!');
    }
    
    // Check for asset directories
    const directories = fs.readdirSync('dist', { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (directories.length > 0) {
      console.log(`\nFound asset directories: ${directories.join(', ')}`);
      directories.forEach(dir => {
        console.log(`\nContents of dist/${dir}:`);
        runCommand(`ls -la dist/${dir}/`);
      });
    } else {
      console.log('\nNo asset directories found in dist');
    }
  } else {
    console.error('❌ dist directory not found after build!');
  }
} else {
  console.error('❌ Client build failed!');
}

console.log('\nClient build test completed');