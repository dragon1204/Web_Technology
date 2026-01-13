// TEST: Paste vào browser console để test storage API
async function testStorageAPI() {
  console.log('🧪 Testing Storage API...');
  
  // Test 1: Check if storage service exists
  try {
    const response = await fetch('http://localhost:3000/storage/exists/test.jpg', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      }
    });
    console.log('✅ Storage API reachable:', response.status);
    const data = await response.json();
    console.log('📦 Response:', data);
  } catch (err) {
    console.error('❌ Storage API error:', err.message);
  }
}

// Run test
testStorageAPI();
