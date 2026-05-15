const http = require('http');

async function testViewerDelete() {
    // 1. Login as Viewer
    const loginData = JSON.stringify({
        email: 'viewer@demo.erp.local',
        password: 'password123'
    });

    const loginOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };

    const loginRes = await new Promise((resolve, reject) => {
        const req = http.request(loginOptions, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });

    console.log('Login Status:', loginRes.statusCode);
    const token = loginRes.body.access_token;

    // 2. Try to Delete
    const deleteOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/products/123',
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const deleteRes = await new Promise((resolve, reject) => {
        const req = http.request(deleteOptions, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.end();
    });

    console.log('Delete status (Expected 403):', deleteRes.statusCode);
    console.log('Delete body:', deleteRes.body);
}

testViewerDelete().catch(console.error);
