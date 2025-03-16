const axios = require('axios');

// Test code execution
async function testCodeExecution() {
  try {
    const response = await axios.post('http://localhost:5001/execute', {
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      input: ''
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCodeExecution();