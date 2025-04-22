#!/usr/bin/env node

/**
 * This script directly fixes hardcoded URLs in the codebase
 * It's a last-resort approach to ensure all URLs are properly fixed
 */

const fs = require('fs');
const path = require('path');

console.log('Starting direct URL fix process...');

// Fix CodeEditor.jsx file
const codeEditorPath = path.join(__dirname, 'client', 'src', 'pages', 'CodeEditor.jsx');

if (fs.existsSync(codeEditorPath)) {
  console.log('Fixing CodeEditor.jsx...');
  
  let content = fs.readFileSync(codeEditorPath, 'utf8');
  
  // Replace all occurrences of hardcoded URLs
  content = content.replace(
    /http:\/\/localhost:5001\/api\/code\/collaborations/g, 
    '/api/code/collaborations'
  );
  
  content = content.replace(
    /http:\/\/localhost:5001\/api\/submissions/g, 
    '/api/submissions'
  );
  
  content = content.replace(
    /http:\/\/localhost:5001\/api\/submissions\/${submissionId}/g, 
    '`/api/submissions/${submissionId}`'
  );
  
  content = content.replace(
    /http:\/\/localhost:5001\/api\/files\/${location\.state\.fileId}/g, 
    '`/api/files/${location.state.fileId}`'
  );
  
  // Special case for the execute endpoint
  content = content.replace(
    /http:\/\/localhost:5001\/execute/g, 
    'executeUrl'
  );
  
  // Write the fixed content back
  fs.writeFileSync(codeEditorPath, content, 'utf8');
  console.log('✅ Fixed CodeEditor.jsx');
} else {
  console.log('❌ CodeEditor.jsx not found!');
}

// Fix any CollaborativeEditor component
const collaborativeEditorPath = path.join(__dirname, 'client', 'src', 'components', 'CollaborativeEditor.jsx');

if (fs.existsSync(collaborativeEditorPath)) {
  console.log('Fixing CollaborativeEditor.jsx...');
  
  let content = fs.readFileSync(collaborativeEditorPath, 'utf8');
  
  // Replace socket URL
  content = content.replace(
    /io\('http:\/\/localhost:5001'/g, 
    "io(import.meta.env.VITE_SOCKET_URL || ''"
  );
  
  // Write the fixed content back
  fs.writeFileSync(collaborativeEditorPath, content, 'utf8');
  console.log('✅ Fixed CollaborativeEditor.jsx');
} else {
  console.log('CollaborativeEditor.jsx not found (this is okay if it doesn\'t exist)');
}

console.log('URL fix process completed!');