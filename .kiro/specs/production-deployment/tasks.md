# Implementation Plan

- [ ] 1. Create dynamic API configuration system for frontend
  - Create src/config/api.js with environment-based URL detection
  - Implement getApiConfig() function that uses window.location for production URLs
  - Add development/production environment detection logic
  - Create fallback mechanisms for different deployment scenarios
  - _Requirements: 1.1, 1.3, 2.1, 2.3_

- [ ] 2. Update frontend API client to use dynamic URLs
  - Modify src/services/api.js to use dynamic configuration
  - Update all API calls to use configurable base URLs
  - Replace hardcoded localhost references with dynamic URL resolution
  - Add proper error handling for URL resolution failures
  - _Requirements: 1.1, 1.2, 2.2, 6.3_

- [ ] 3. Fix WebSocket connection management for production
  - Update WebSocket connection logic to use dynamic URLs
  - Replace hardcoded ws://localhost references with environment-based URLs
  - Add proper WebSocket URL construction for different protocols (ws/wss)
  - Implement connection retry logic with dynamic URL resolution
  - _Requirements: 1.3, 8.1, 8.2, 8.4_

- [ ] 4. Update Docker configuration for production deployment
  - Modify docker-compose.yml to use proper container networking
  - Remove hardcoded localhost references from Docker configuration
  - Configure backend to bind to 0.0.0.0 instead of localhost
  - Set up proper port exposure and container communication
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Configure nginx reverse proxy for API and WebSocket routing
  - Create nginx.conf with proper API proxying to backend container
  - Add WebSocket proxy configuration for /ws/ endpoints
  - Configure static file serving for React build
  - Add proper headers for cross-origin requests and WebSocket upgrades
  - _Requirements: 5.1, 5.3, 6.1, 6.2_

- [ ] 6. Update frontend Dockerfile for production builds
  - Modify frontend Dockerfile to use multi-stage build process
  - Configure nginx to serve React build and proxy API requests
  - Remove development-specific configurations from production build
  - Add proper environment variable handling for build-time configuration
  - _Requirements: 4.1, 4.2, 6.4_

- [ ] 7. Update backend CORS configuration for production
  - Modify FastAPI CORS middleware to use environment variables
  - Add dynamic origin validation based on deployment environment
  - Configure proper CORS headers for production deployment
  - Add security headers for production environments
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 8. Fix dice functionality to populate admin fields instead of auto-submitting
  - Modify DiceQuestionSelector component to fill form fields instead of submitting
  - Update dice API endpoint to return question data without triggering submission
  - Add visual feedback when dice question is loaded into admin fields
  - Ensure game master can edit dice-selected questions before manual submission
  - _Requirements: 3.1, 3.2, 3.3, 7.1, 7.2_

- [ ] 9. Update game master panel to handle dice question editing
  - Modify GameMasterPanel to receive dice question data in form fields
  - Add visual indicators when a dice question is loaded
  - Implement manual submission workflow after dice question selection
  - Add form validation for edited dice questions
  - _Requirements: 3.2, 3.3, 7.2, 7.3, 7.4_

- [ ] 10. Add environment-based configuration management
  - Create environment variable configuration for backend settings
  - Add production/development environment detection
  - Implement configurable CORS origins and security settings
  - Add logging configuration for production monitoring
  - _Requirements: 2.1, 2.2, 2.4, 8.1, 8.3_

- [ ] 11. Update all hardcoded localhost references in frontend components
  - Search and replace all localhost references in React components
  - Update WebSocket connection initialization in GameContext
  - Modify API calls in all service files to use dynamic configuration
  - Update any remaining hardcoded URLs in utility functions
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 12. Add production logging and monitoring
  - Implement structured logging in FastAPI backend
  - Add request/response logging for API endpoints
  - Create health check endpoints for container monitoring
  - Add error logging with proper context for debugging
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13. Test production deployment with docker-compose
  - Build and test complete application using docker-compose up
  - Verify all API calls work without localhost references
  - Test WebSocket connections in containerized environment
  - Validate that application works with different server IPs
  - _Requirements: 1.4, 4.3, 4.4_

- [ ] 14. Add configuration validation and error handling
  - Implement configuration validation on application startup
  - Add clear error messages for misconfigured environments
  - Create fallback mechanisms for missing environment variables
  - Add startup health checks to verify proper configuration
  - _Requirements: 2.4, 8.2, 8.3_

- [ ] 15. Update development scripts and documentation
  - Modify start-dev scripts to work with new configuration system
  - Update README.md with production deployment instructions
  - Add environment variable documentation
  - Create troubleshooting guide for common deployment issues
  - _Requirements: 2.1, 2.3, 6.4_