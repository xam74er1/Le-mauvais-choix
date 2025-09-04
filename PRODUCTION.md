# Production Deployment Guide

## Quick Start

Your application is already production-ready! Simply run:

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://your-server-ip (port 80)
- **Backend API**: http://your-server-ip/api
- **WebSocket**: ws://your-server-ip/ws
- **Health Check**: http://your-server-ip/api/health

## Configuration

### Environment Variables

The application automatically detects the environment and configures URLs dynamically:

- **Development**: Uses localhost URLs when `NODE_ENV=development`
- **Production**: Uses the server's actual IP/domain automatically

### Docker Configuration

The `docker-compose.yml` is configured for production with:
- Backend exposed only internally (port 8000)
- Frontend accessible externally (port 80)
- Nginx reverse proxy for API and WebSocket routing
- Proper container networking

### CORS Configuration

CORS is configured via environment variables:
- `CORS_ORIGINS=*` (default) - allows all origins
- `CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com` - specific domains

## Features Working Out of the Box

### ✅ Dynamic URL Configuration
- Frontend automatically detects server IP/domain
- No hardcoded localhost references in production
- WebSocket connections work with any server address

### ✅ Dice Functionality Fixed
- Dice button loads questions into admin fields for review
- Game master can edit questions before submitting
- No auto-submission - manual control maintained

### ✅ Production-Ready Docker Setup
- Multi-stage frontend build for optimized images
- Nginx reverse proxy for API and WebSocket routing
- Proper container networking and communication
- Health check endpoint for monitoring

## Deployment Options

### Option 1: Simple Docker Compose (Recommended)
```bash
# Clone your repository
git clone <your-repo>
cd <your-repo>

# Start the application
docker-compose up --build -d

# Check status
docker-compose ps
```

### Option 2: With Custom Domain
```bash
# Set environment variables
export CORS_ORIGINS="https://yourdomain.com"

# Start with custom configuration
docker-compose up --build -d
```

### Option 3: Behind Reverse Proxy
If you're using nginx or another reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring

### Health Check
```bash
curl http://your-server-ip/api/health
```

Response:
```json
{
  "status": "healthy",
  "environment": "production",
  "cors_origins": "*",
  "active_sessions": 0
}
```

### Logs
```bash
# View application logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Troubleshooting

### Common Issues

1. **Can't connect to WebSocket**
   - Check that port 80 is accessible
   - Verify nginx is proxying /ws/ correctly
   - Check browser console for connection errors

2. **API calls failing**
   - Verify /api/ routes are being proxied to backend
   - Check CORS configuration
   - Review backend logs for errors

3. **Frontend not loading**
   - Ensure nginx is serving static files correctly
   - Check that build completed successfully
   - Verify port 80 is accessible

### Debug Commands
```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Test API directly
curl http://localhost/api/health

# Test WebSocket (using wscat if installed)
wscat -c ws://localhost/ws/test/test
```

## Security Considerations

For production deployment, consider:

1. **HTTPS**: Use a reverse proxy with SSL certificates
2. **CORS**: Set specific allowed origins instead of "*"
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Firewall**: Restrict access to necessary ports only

## Scaling

The application can be scaled by:
1. Running multiple backend containers behind a load balancer
2. Using Redis for session storage instead of in-memory storage
3. Adding horizontal scaling with container orchestration (Kubernetes, Docker Swarm)

## Support

The application is now production-ready with:
- ✅ No localhost dependencies
- ✅ Dynamic URL configuration
- ✅ Fixed dice functionality
- ✅ Proper Docker networking
- ✅ Health monitoring
- ✅ Production logging

Simply run `docker-compose up --build` and your trivia game will be accessible on your server!