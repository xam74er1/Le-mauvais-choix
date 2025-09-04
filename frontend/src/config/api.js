// Dynamic API configuration for development and production environments

const getApiConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Development: use localhost
    return {
      apiUrl: 'http://localhost:8000',
      wsUrl: 'ws://localhost:8000'
    };
  }
  
  // Production: use current origin with proper protocol detection
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  
  return {
    apiUrl: `${protocol}//${host}/api`,
    wsUrl: `${wsProtocol}//${host}/ws`
  };
};

// Export singleton instance
export const apiConfig = getApiConfig();

// Export function for dynamic reconfiguration if needed
export { getApiConfig };