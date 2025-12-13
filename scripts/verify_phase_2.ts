// Phase 2 Verification Script
// Tests backend routes with axios

import axios from 'axios';

const API_BASE = 'http://localhost:3000';
let authToken: string = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.yellow}ℹ️  ${msg}${colors.reset}`),
};

async function testLogin() {
  console.log('\n🔐 Testing Authentication...');

  try {
    // Test with invalid credentials
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'wrong@email.com',
        password: 'wrongpassword',
      });
      log.error('Login should fail with invalid credentials');
      return false;
    } catch (error: any) {
      if (error.response?.status === 401) {
        log.success('Invalid credentials rejected correctly');
      }
    }

    // Test with valid credentials (from seeder)
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@talonforge.io',
      password: 'admin123',
    });

    if (response.status === 200 && response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      log.success('Login successful with valid credentials');
      log.success(`JWT token received: ${authToken.substring(0, 20)}...`);
      return true;
    }

    log.error('Login response invalid');
    return false;
  } catch (error: any) {
    log.error(`Login test failed: ${error.message}`);
    return false;
  }
}

async function testInstances() {
  console.log('\n📦 Testing Instance Endpoints...');

  try {
    const headers = { Authorization: `Bearer ${authToken}` };

    // GET /instances
    const listResponse = await axios.get(`${API_BASE}/instances`, { headers });

    if (listResponse.status === 200 && Array.isArray(listResponse.data.data)) {
      log.success('GET /instances returns array');
    } else {
      log.error('GET /instances failed');
      return false;
    }

    // POST /instances/test with fake credentials
    const testResponse = await axios.post(
      `${API_BASE}/instances/test`,
      {
        type: 'talon',
        url: 'https://fake-url.com',
        credentials: { apiKey: 'fake-key' },
      },
      { headers }
    );

    if (testResponse.status === 200 && testResponse.data.success) {
      const result = testResponse.data.data;
      if (result.success === false) {
        log.success('Connection test returns success:false for invalid credentials');
      } else {
        log.error('Connection test should fail with fake credentials');
        return false;
      }
    } else {
      log.error('POST /instances/test failed');
      return false;
    }

    return true;
  } catch (error: any) {
    log.error(`Instance tests failed: ${error.message}`);
    return false;
  }
}

async function testHealth() {
  console.log('\n🏥 Testing Health Endpoint...');

  try {
    const response = await axios.get(`${API_BASE}/health`);

    if (response.status === 200 && response.data.success) {
      log.success('Health check passed');
      return true;
    }

    log.error('Health check failed');
    return false;
  } catch (error: any) {
    log.error(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testAdmin() {
  console.log('\n🔧 Testing Admin Endpoints...');

  try {
    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await axios.get(`${API_BASE}/admin/stats`, { headers });

    if (response.status === 200 && response.data.success) {
      log.success('GET /admin/stats works');
      return true;
    }

    log.error('GET /admin/stats failed');
    return false;
  } catch (error: any) {
    log.error(`Admin tests failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('=== Phase 2 Verification ===');
  console.log('');
  log.info('Make sure the server is running: cd server && npm run dev');
  log.info('Waiting 3 seconds for server to be ready...');

  await new Promise((resolve) => setTimeout(resolve, 3000));

  let failures = 0;

  if (!(await testHealth())) failures++;
  if (!(await testLogin())) failures++;
  if (!(await testInstances())) failures++;
  if (!(await testAdmin())) failures++;

  console.log('\n================================');

  if (failures === 0) {
    log.success('✅ Phase 2 Verification PASSED');
    console.log('All backend routes working correctly!');
    console.log('Ready to proceed to Phase 3!');
    process.exit(0);
  } else {
    log.error(`❌ Phase 2 Verification FAILED`);
    console.log(`Found ${failures} test failure(s).`);
    process.exit(1);
  }
}

runTests();
