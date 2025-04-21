const axios = require('axios');
const readline = require('readline');

// Get login token
const getToken = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };

  try {
    const email = await askQuestion('Enter your email: ');
    const password = await askQuestion('Enter your password: ');
    
    const response = await axios.post('http://localhost:5001/api/users/login', {
      email,
      password
    });
    
    rl.close();
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    rl.close();
    process.exit(1);
  }
};

// Test file operations
const testFileOperations = async (token) => {
  const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  try {
    // 1. Create a folder
    console.log('\n1. Creating a folder...');
    const folderResponse = await api.post('/files', {
      name: 'Test Folder',
      type: 'folder'
    });
    
    console.log('Folder created:', folderResponse.data);
    const folderId = folderResponse.data._id;
    
    // 2. Create a file inside the folder
    console.log('\n2. Creating a file inside the folder...');
    const fileResponse = await api.post('/files', {
      name: 'test.js',
      type: 'file',
      content: '// This is a test file\nconsole.log("Hello world!");',
      parentId: folderId
    });
    
    console.log('File created:', fileResponse.data);
    const fileId = fileResponse.data._id;
    
    // 3. Get file tree
    console.log('\n3. Getting file tree...');
    const treeResponse = await api.get('/files/tree');
    console.log('File tree:', JSON.stringify(treeResponse.data, null, 2));
    
    // 4. Get file by ID
    console.log('\n4. Getting file by ID...');
    const fileByIdResponse = await api.get(`/files/${fileId}`);
    console.log('File by ID:', fileByIdResponse.data);
    
    // 5. Update file content
    console.log('\n5. Updating file content...');
    const updateResponse = await api.put(`/files/${fileId}`, {
      content: '// Updated content\nconsole.log("Hello updated world!");'
    });
    
    console.log('File updated:', updateResponse.data);
    
    // 6. Create another folder for move operation
    console.log('\n6. Creating another folder for move operation...');
    const folder2Response = await api.post('/files', {
      name: 'Another Folder',
      type: 'folder'
    });
    
    console.log('Second folder created:', folder2Response.data);
    const folder2Id = folder2Response.data._id;
    
    // 7. Move file to new folder
    console.log('\n7. Moving file to new folder...');
    const moveResponse = await api.put(`/files/${fileId}/move`, {
      newParentId: folder2Id
    });
    
    console.log('File moved:', moveResponse.data);
    
    // 8. Get files in new folder
    console.log('\n8. Getting files in new folder...');
    const newFolderFilesResponse = await api.get('/files', {
      params: { parentId: folder2Id }
    });
    
    console.log('Files in new folder:', newFolderFilesResponse.data);
    
    // 9. Delete file
    console.log('\n9. Deleting file...');
    const deleteFileResponse = await api.delete(`/files/${fileId}`);
    console.log('File deleted:', deleteFileResponse.data);
    
    // 10. Delete folders
    console.log('\n10. Deleting folders...');
    const deleteFolder1Response = await api.delete(`/files/${folderId}`);
    const deleteFolder2Response = await api.delete(`/files/${folder2Id}`);
    console.log('Folders deleted');
    
    console.log('\nAll file operations completed successfully!');
  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
};

// Main function
const main = async () => {
  try {
    console.log('Getting authentication token...');
    const token = await getToken();
    
    if (!token) {
      console.error('Failed to get token');
      return;
    }
    
    console.log('Authentication successful!');
    await testFileOperations(token);
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the tests
main(); 