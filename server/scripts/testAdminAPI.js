const fetch = require('node-fetch');

async function testAdminAPI() {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('🧪 Testing Admin API Endpoints\n');
  
  try {
    // Test 1: Try to access admin endpoint without auth (should fail)
    console.log('Test 1: Access admin endpoint without authentication');
    const noAuthResponse = await fetch(`${BASE_URL}/api/admin/users`);
    console.log(`Status: ${noAuthResponse.status} ${noAuthResponse.statusText}`);
    if (noAuthResponse.status === 401 || noAuthResponse.status === 403) {
      console.log('✅ Correctly blocked unauthorized access\n');
    } else {
      console.log('⚠️  Warning: Endpoint accessible without auth\n');
    }

    // Test 2: Login as admin
    console.log('Test 2: Login as admin');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin1234@gmail.com',
        password: 'admin1234'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log(`Status: ${loginResponse.status}`);
    console.log(`Response:`, loginData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Admin login failed!');
      console.log('Possible reasons:');
      console.log('1. Admin account not created');
      console.log('2. Wrong password');
      console.log('3. Account not active\n');
      return;
    }
    
    // Extract cookies
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('✅ Admin logged in successfully');
    console.log('Cookies:', cookies ? 'Present' : 'Missing');
    console.log('');

    // Test 3: Access admin users endpoint with auth
    console.log('Test 3: Access admin users endpoint');
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    
    const usersData = await usersResponse.json();
    console.log(`Status: ${usersResponse.status}`);
    
    if (usersResponse.status === 200) {
      console.log('✅ Successfully fetched users');
      console.log(`Total users: ${usersData.total || usersData.users?.length || 0}`);
      if (usersData.users && usersData.users.length > 0) {
        console.log('\nUsers in database:');
        usersData.users.forEach(user => {
          console.log(`- ${user.email} (${user.role}) - Profile: ${user.profile?.name || 'N/A'}`);
        });
      }
    } else {
      console.log('❌ Failed to fetch users');
      console.log('Response:', usersData);
    }
    console.log('');

    // Test 4: Get admin stats
    console.log('Test 4: Get admin analytics stats');
    const statsResponse = await fetch(`${BASE_URL}/api/admin/analytics/stats`, {
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    
    const statsData = await statsResponse.json();
    console.log(`Status: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      console.log('✅ Stats fetched successfully');
      console.log(statsData);
    } else {
      console.log('❌ Failed to fetch stats');
      console.log('Response:', statsData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Server not running on port 3000');
    console.log('2. Database connection issue');
    console.log('3. API routes not properly configured');
  }
}

testAdminAPI();
