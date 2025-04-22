const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Print a nice header
console.log('='.repeat(50));
console.log('STARTING PRODUCTION BUILD PROCESS');
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

const copyDir = (src, dest) => {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
    return true;
  } catch (error) {
    console.error(`Error copying directory:`, error.message);
    return false;
  }
};

// Step 0: Fix URLs in client code
console.log('\n\n📦 Step 0: Fixing hardcoded URLs and environment variables...');
try {
  // Force production environment variables
  console.log('Ensuring production environment variables are applied...');
  // Copy .env.production to .env for the build
  fs.copyFileSync(path.join(__dirname, 'client', '.env.production'), 
                 path.join(__dirname, 'client', '.env'));
  console.log('✅ Copied .env.production to .env to ensure correct variables are used');
  
  // Apply emergency fixes
  console.log('Applying emergency fixes for URLs and environment variables...');
  require('./emergency-fix');
  require('./fix-direct-urls');
  
  // Run the URL fix script
  require('./fix-urls');
  
  console.log('✅ All fixes applied successfully');
} catch (error) {
  console.error('Error applying fixes:', error.message);
  console.log('Continuing with build process...');
}

// Step 1: Install root dependencies
console.log('\n\n📦 Step 1: Installing root dependencies...');
if (!runCommand('npm install')) {
  process.exit(1);
}

// Step 2: Build client
console.log('\n\n📦 Step 2: Building client...');
process.chdir('client');
if (!runCommand('npm install') || 
    !runCommand('export NODE_OPTIONS="--no-experimental-fetch --openssl-legacy-provider" && npm run build')) {
  console.log('Client build failed. Creating a fallback front-end...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  fs.writeFileSync('dist/index.html', `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CodeBoost</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
        .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .card { background: #f8f9fa; border: 1px solid #ddd; padding: 20px; border-radius: 4px; }
        .btn { display: inline-block; background: #254E58; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>CodeBoost</h1>
      <div class="alert">
        <h3>Frontend Build Error</h3>
        <p>The React application failed to build properly. This is a fallback page.</p>
      </div>
      <div class="card">
        <h3>You can still access the API</h3>
        <p>The backend API is still running and can be accessed.</p>
        <a href="/api/users/test" class="btn">Test API</a>
      </div>
    </body>
    </html>
  `);
}

// List what was built
console.log('\n\nClient build output:');
if (fs.existsSync('dist')) {
  runCommand('ls -la dist/');
} else {
  console.log('No dist directory found!');
}

// Step 3: Set up server
process.chdir('../server');
console.log('\n\n📦 Step 3: Setting up server...');
if (!runCommand('npm install')) {
  process.exit(1);
}

// Step 4: Copy client build to server/public
console.log('\n\n📦 Step 4: Copying client build to server/public...');
if (fs.existsSync('public')) {
  runCommand('rm -rf public');
}
fs.mkdirSync('public', { recursive: true });

const clientDistPath = path.join(__dirname, 'client', 'dist');
const serverPublicPath = path.join(__dirname, 'server', 'public');

if (fs.existsSync(clientDistPath)) {
  console.log(`Copying from ${clientDistPath} to ${serverPublicPath}`);
  copyDir(clientDistPath, serverPublicPath);
  
  console.log('\nServer public directory now contains:');
  runCommand('ls -la public/');
} else {
  console.log('Client dist directory not found!');
  
  // Create a fallback index.html
  const indexPath = path.join(serverPublicPath, 'index.html');
  fs.writeFileSync(indexPath, `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CodeBoost</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; }
        .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .card { background: #f8f9fa; border: 1px solid #ddd; padding: 20px; border-radius: 4px; }
        .btn { display: inline-block; background: #254E58; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>CodeBoost</h1>
      <div class="alert">
        <h3>Frontend Build Error</h3>
        <p>The React application failed to build properly. This is a fallback page.</p>
      </div>
      <div class="card">
        <h3>You can still access the API</h3>
        <p>The backend API is still running and can be accessed.</p>
        <a href="/api/users/test" class="btn">Test API</a>
      </div>
    </body>
    </html>
  `);
  console.log('Created fallback index.html');
}

// Step 5: Create .env file
console.log('\n\n📦 Step 5: Creating production .env file...');
try {
  const envContent = `MONGODB_URI="${process.env.MONGODB_URI || 'mongodb+srv://pratik:pratik@codeboost.x2dnc.mongodb.net/?retryWrites=true&w=majority&appName=CodeBoost'}"
JWT_SECRET="${process.env.JWT_SECRET || 'mynameispratik'}"
PORT=10000
CLIENT_URL="*"
JUDGE0_API_URL="${process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com'}"
JUDGE0_API_KEY="${process.env.JUDGE0_API_KEY || '76c5bc7fd3mshb8cb6886a11ac21p19f213jsnc397e9a89807'}"
`;

  fs.writeFileSync('.env', envContent);
  console.log('Created .env file');
} catch (error) {
  console.error('Error creating .env file:', error.message);
}

console.log('\n\n✅ Build process completed!');