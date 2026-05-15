const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGRlbW8uZXJwLmxvY2FsIiwic3ViIjoiMTk0ZjMxNTUtZGRkMy00NTc4LThkNWYtYjg1YWQzNDI0YWJjIiwidGVuYW50SWQiOiJ0ZW5hbnQtZGVtby0wMDEiLCJyb2xlIjoiQURNSU4iLCJ1c2VybmFtZSI6ImFkbWluIiwic3ViZG9tYWluIjpudWxsLCJpYXQiOjE3NzA2MzQ4OTIsImV4cCI6MTc3MDcyMTI5Mn0.HFQPDVNmAyfnclDbsQYxZzPX2iPNrqnyvdmTL-3aOrc';

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/products',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, res => {
    console.log(`Status Code: ${res.statusCode}`);
    let responseData = '';

    res.on('data', chunk => {
        responseData += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(responseData);
            console.log('Response (first 2 items):', JSON.stringify(json.slice(0, 2), null, 2));
        } catch (e) {
            console.log('Response Body:', responseData);
        }
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.end();
