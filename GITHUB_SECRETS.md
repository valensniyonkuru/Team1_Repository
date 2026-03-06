# GitHub Secrets Configuration

This guide helps you set up GitHub Secrets for CI/CD deployment.

## Access GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **New repository secret**

## Required Secrets

### Docker Registry Credentials

```
Name: DOCKER_USERNAME
Value: your-docker-hub-username
```

```
Name: DOCKER_PASSWORD
Value: your-docker-hub-personal-access-token
```

> Get Docker PAT: https://hub.docker.com/settings/security

### EC2 & SSH Access

```
Name: EC2_DEPLOY_KEY
Value: (contents of ~/.ssh/id_communityboard)
```

Example:
```bash
cat ~/.ssh/id_communityboard | base64
# Copy the output
```

```
Name: STAGING_EC2_HOST
Value: staging-instance-public-ip
```

```
Name: STAGING_EC2_USER
Value: ubuntu
```

```
Name: PRODUCTION_EC2_HOST
Value: production-instance-public-ip
```

```
Name: PRODUCTION_EC2_USER
Value: ubuntu
```

### Staging Environment Secrets

```
Name: STAGING_DB_NAME
Value: communityboard
```

```
Name: STAGING_DB_USER
Value: postgres
```

```
Name: STAGING_DB_PASSWORD
Value: your-secure-password-from-terraform-setup
```

```
Name: STAGING_JWT_SECRET
Value: your-jwt-secret-from-terraform-setup
```

```
Name: STAGING_API_URL
Value: http://staging-ec2-public-ip:8080
```

### Production Environment Secrets

```
Name: PRODUCTION_DB_NAME
Value: communityboard
```

```
Name: PRODUCTION_DB_USER
Value: postgres
```

```
Name: PRODUCTION_DB_PASSWORD
Value: strong-production-password
```

```
Name: PRODUCTION_JWT_SECRET
Value: strong-production-jwt-secret
```

```
Name: PRODUCTION_API_URL
Value: https://api.example.com
```

## Verification Script

Run this after adding secrets to verify they're accessible:

```bash
# GitHub CLI (install: https://cli.github.com/)
gh secret list

# Output should show all configured secrets
```

## Security Best Practices

✓ **DO:**
- Use unique, strong passwords for each environment
- Rotate secrets every 90 days
- Use PAT tokens instead of passwords for registries
- Limit EC2_DEPLOY_KEY file permissions (600)
- Review GitHub Actions logs for exposed values

✗ **DON'T:**
- Use the same password for staging and production
- Commit .env files with real secrets
- Share secrets in chat/email
- Use personal access tokens in code
- Enable debug logging on sensitive actions

## Checking Secret Usage in Workflows

All secrets used in workflows appear as `***` in logs:

```yaml
- name: Example
  run: echo ${{ secrets.DOCKER_PASSWORD }}  # Logs as: echo ***
```

## Emergency Secret Rotation

If a secret is compromised:

1. Immediately modify/regenerate the secret
2. Github Actions will use the new value on next run
3. Review the workflow that used the compromised secret
4. Check deployment logs in target environment

## Troubleshooting

**Error: Secret not found**
- Verify secret name matches exactly (case-sensitive)
- Confirm you're accessing from the correct repository

**Workflow fails with permission denied**
- Check EC2_DEPLOY_KEY format (should be raw private key)
- Verify IP is in EC2 security group
- Ensure SSH key pair matches on EC2 instance

**Secrets visible in logs**
- This should not happen - GitHub masks secrets automatically
- If it does, rotate the secret immediately
- Check for print statements or debug logging
