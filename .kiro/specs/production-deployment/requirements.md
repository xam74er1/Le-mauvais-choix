# Requirements Document

## Introduction

This feature transforms the multiplayer trivia game "Le mauvais choix" from a development environment with hardcoded localhost references into a production-ready application that can be deployed on any server with dynamic IP configuration. Additionally, it fixes the dice functionality bug where clicking to access the next question incorrectly auto-submits instead of filling the admin fields for manual review and submission.

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to deploy the application on any server without hardcoded localhost references, so that the application works correctly regardless of the server's IP address or domain name.

#### Acceptance Criteria

1. WHEN the application is deployed THEN it SHALL automatically detect and use the server's IP address or domain name
2. WHEN frontend components make API calls THEN they SHALL use dynamic backend URLs based on the deployment environment
3. WHEN WebSocket connections are established THEN they SHALL use the correct server address without localhost hardcoding
4. IF the server IP changes THEN the application SHALL continue to work without code modifications

### Requirement 2

**User Story:** As a developer, I want environment-based configuration management, so that the application can run in development, staging, and production environments with appropriate settings.

#### Acceptance Criteria

1. WHEN the application starts THEN it SHALL load configuration based on the current environment (development/production)
2. WHEN in development mode THEN the application SHALL use localhost URLs and development settings
3. WHEN in production mode THEN the application SHALL use dynamic server detection and production settings
4. WHEN environment variables are provided THEN they SHALL override default configuration values

### Requirement 3

**User Story:** As a game master, I want the dice functionality to fill the admin fields instead of auto-submitting, so that I can review and edit the randomly selected question before presenting it to players.

#### Acceptance Criteria

1. WHEN I click the dice button THEN the system SHALL populate the question and answer fields with the randomly selected content
2. WHEN a random question is loaded THEN I SHALL be able to edit both the question and answer before submitting
3. WHEN I modify a dice-selected question THEN the changes SHALL be reflected in the admin interface
4. WHEN I am ready to present the question THEN I SHALL manually click submit to send it to players

### Requirement 4

**User Story:** As a system administrator, I want Docker containers that work in production environments, so that the application can be deployed consistently across different servers and hosting platforms.

#### Acceptance Criteria

1. WHEN Docker containers are built THEN they SHALL not contain hardcoded localhost references
2. WHEN containers are deployed THEN they SHALL communicate using container networking and environment variables
3. WHEN the application runs in containers THEN it SHALL be accessible from external networks
4. WHEN scaling the application THEN containers SHALL work with load balancers and reverse proxies

### Requirement 5

**User Story:** As a developer, I want proper CORS configuration and security headers, so that the application works correctly when frontend and backend are served from different domains or ports.

#### Acceptance Criteria

1. WHEN the frontend and backend are on different domains THEN CORS SHALL be properly configured to allow communication
2. WHEN API requests are made THEN appropriate security headers SHALL be included
3. WHEN WebSocket connections are established THEN they SHALL work across different origins in production
4. WHEN the application is accessed THEN it SHALL include proper security headers for production deployment

### Requirement 6

**User Story:** As a system administrator, I want configurable base URLs and API endpoints, so that the application can work with different deployment architectures (reverse proxies, subdomains, etc.).

#### Acceptance Criteria

1. WHEN the application is deployed behind a reverse proxy THEN it SHALL work correctly with path prefixes
2. WHEN using custom domains or subdomains THEN the application SHALL adapt to the URL structure
3. WHEN API endpoints change THEN the configuration SHALL be easily updatable without code changes
4. WHEN deploying to cloud platforms THEN the application SHALL work with their URL schemes

### Requirement 7

**User Story:** As a game master, I want clear visual feedback when using the dice functionality, so that I understand the current state and what actions are available.

#### Acceptance Criteria

1. WHEN I click the dice button THEN I SHALL see a clear indication that a question has been loaded
2. WHEN a dice question is loaded THEN the interface SHALL clearly show that I can edit the content
3. WHEN I edit a dice question THEN the interface SHALL indicate that changes have been made
4. WHEN I submit a dice question THEN the interface SHALL provide confirmation of the submission

### Requirement 8

**User Story:** As a developer, I want proper logging and monitoring capabilities, so that I can troubleshoot issues and monitor the application's health in production.

#### Acceptance Criteria

1. WHEN the application runs THEN it SHALL log important events and errors with appropriate detail
2. WHEN errors occur THEN they SHALL be logged with sufficient context for debugging
3. WHEN the application starts THEN it SHALL log configuration information for verification
4. WHEN API requests are made THEN they SHALL be logged with response times and status codes