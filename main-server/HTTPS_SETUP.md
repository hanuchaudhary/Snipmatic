# HTTPS Setup Instructions

This document explains how to enable HTTPS support for the Snipmatic server.

## Prerequisites

- OpenSSL installed on your system
- Docker and Docker Compose

## Quick Setup

### For Windows (PowerShell)
```powershell
# Generate SSL certificates
.\generate-ssl-cert.ps1

# Start the services
docker-compose up -d
```

### For Linux/macOS (Bash)
```bash
# Make the script executable
chmod +x generate-ssl-cert.sh

# Generate SSL certificates
./generate-ssl-cert.sh

# Start the services
docker-compose up -d
```

## Manual Certificate Generation

If you prefer to generate certificates manually:

```bash
# Create SSL directory
mkdir ssl

# Generate private key
openssl genrsa -out ssl/nginx.key 2048

# Generate certificate (valid for 365 days)
openssl req -new -x509 -key ssl/nginx.key -out ssl/nginx.crt -days 365 -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"
```

## Configuration Details

### What's Changed

1. **Nginx Configuration**: 
   - Added HTTPS server block listening on port 443
   - HTTP traffic (port 80) now redirects to HTTPS
   - Added SSL/TLS security headers
   - Configured modern SSL protocols and ciphers

2. **Docker Compose**:
   - Added port 443 mapping for HTTPS
   - Mounted SSL certificate directory

3. **Security Features**:
   - HTTP Strict Transport Security (HSTS)
   - Modern TLS protocols (1.2 and 1.3)
   - Secure cipher suites
   - Additional security headers

### File Structure

After setup, your SSL directory should contain:
```
ssl/
├── nginx.crt  (SSL certificate)
└── nginx.key  (Private key)
```

## Accessing the Application

- **HTTPS**: https://localhost (recommended)
- **HTTP**: http://localhost (redirects to HTTPS)

## Browser Security Warning

Since we're using self-signed certificates for development, browsers will show a security warning. This is normal for development environments. To proceed:

1. Click "Advanced" or "More Information"
2. Click "Proceed to localhost (unsafe)" or similar option

## Production Considerations

For production deployment:

1. **Use Real Certificates**: Obtain certificates from a trusted Certificate Authority (CA) like:
   - Let's Encrypt (free)
   - DigiCert
   - GlobalSign

2. **Update Domain**: Replace `localhost` with your actual domain name in:
   - Certificate generation
   - Nginx server_name directive

3. **Certificate Renewal**: Set up automatic renewal for your certificates

4. **Additional Security**: Consider implementing:
   - Certificate Transparency monitoring
   - OCSP stapling
   - Advanced security headers

## Troubleshooting

### Certificate Issues
- Ensure SSL files exist in the `ssl/` directory
- Check file permissions (readable by nginx)
- Verify certificate validity: `openssl x509 -in ssl/nginx.crt -text -noout`

### Docker Issues
- Restart containers after certificate generation
- Check nginx logs: `docker-compose logs nginx`

### Port Conflicts
- Ensure ports 80 and 443 are available
- On Windows, check if IIS or other services are using these ports

## Security Notes

- Self-signed certificates are for development only
- Never commit private keys to version control
- Rotate certificates regularly in production
- Monitor certificate expiration dates
