// Quick test of the API configuration
const { apiConfig } = require('./frontend/src/config/api.js');

console.log('Testing API Configuration:');
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('API Config:', apiConfig);

// Test different scenarios
process.env.NODE_ENV = 'development';
const { getApiConfig } = require('./frontend/src/config/api.js');
console.log('Development config:', getApiConfig());

process.env.NODE_ENV = 'production';
console.log('Production config:', getApiConfig());