# 🔐 Security Setup Guide

## Environment Variables

### ⚠️ CRITICAL SECURITY NOTICE
The following files contain sensitive information and are excluded from git:

### Server Environment (server/.env)
- `JWT_ACCESS_SECRET` - JWT token signing secret
- `JWT_REFRESH_SECRET` - Refresh token signing secret  
- `RAZORPAY_KEY_SECRET` - Razorpay private API key
- `MONGO_URI` - Database connection string
- `RAZORPAY_WEBHOOK_SECRET` - Webhook verification secret

### Client Environment (client/.env)
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key (less sensitive but still private)

## Setup Instructions

### For Developers:
1. Copy `.env.example` files to `.env` in both client and server directories:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

2. Replace placeholder values with actual credentials:
   - Get Razorpay keys from: https://dashboard.razorpay.com/#/app/keys
   - Generate strong JWT secrets (recommended 32+ character random strings)
   - Set up MongoDB connection string

### For Production:
1. Use environment-specific configuration
2. Generate production-grade secrets
3. Use environment variables instead of .env files when possible
4. Enable Razorpay live mode with live keys

## Files Protected by .gitignore

### Environment Files:
- `**/.env*` (except .env.example)
- `**/secrets/`
- `**/keys/`
- `**/*secret*`
- `**/*key*`

### Certificates & Keys:
- `*.pem`, `*.key`, `*.crt`, `*.cer`
- `*.p12`, `*.pfx`

### Credentials:
- `credentials.json`
- `service-account*.json`
- `aws-credentials*`
- `gcp-credentials*`

## Security Best Practices

### ✅ DO:
- Use .env.example for documentation
- Generate strong, unique secrets for each environment
- Rotate keys regularly
- Use different keys for development/staging/production
- Keep Razorpay in test mode during development

### ❌ DON'T:
- Commit .env files to git
- Share secrets in chat/email
- Use production keys in development
- Hardcode secrets in source code
- Reuse secrets across projects

## Emergency Response

If secrets are accidentally committed:
1. Immediately rotate all exposed keys
2. Update Razorpay keys in dashboard
3. Generate new JWT secrets
4. Update all environment configurations
5. Consider using `git filter-branch` to remove from history

## Verification

Before pushing to git, verify sensitive files are ignored:
```bash
git status
# Should not show any .env files
```

Check what would be committed:
```bash
git ls-files --others --ignored --exclude-standard
# Should list .env files as ignored
```