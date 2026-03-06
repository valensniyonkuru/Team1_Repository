# Quick Reference Guide - Community Board DevOps

## Frequently Used Commands

### Terraform

```bash
# Initialize
cd terraform/environments/staging
terraform init

# Plan changes
terraform plan -var-file="staging.tfvars"

# Apply infrastructure
terraform apply -var-file="staging.tfvars"

# Destroy
terraform destroy -var-file="staging.tfvars"

# Get outputs
terraform output
terraform output instance_public_ip
```

### Docker & Compose

```bash
# Build images
docker-compose build
docker-compose -f docker-compose.staging.yml build

# Start services
docker-compose up -d
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f

# Stop services
docker-compose down

# Status
docker-compose ps
docker ps

# Resource usage
docker stats
```

### EC2 Access

```bash
# Get IP address
STAGING_IP=$(cd terraform/environments/staging && terraform output -raw instance_public_ip)

# SSH access
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP

# As appuser
sudo su - appuser
cd /opt/app

# View logs
docker-compose logs backend
docker-compose -f docker-compose.staging.yml logs -f backend

# Restart services
docker-compose down
docker-compose pull
docker-compose up -d
```

### Database Operations

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d communityboard

# Useful psql commands:
\l          # List databases
\dt         # List tables
\du         # List users
\q          # Quit
```

### Testing

```bash
# Backend
cd backend
mvn clean test

# Frontend
cd frontend
npm test

# Integration tests
mvn clean verify
```

### GitHub Actions

```bash
# Monitor workflows
# 1. Go to Actions tab in GitHub
# 2. Click on workflow
# 3. View logs in real-time
```

### Make Commands (if Makefile available)

```bash
make help              # Show all available commands
make init             # Initialize Terraform
make plan-staging     # Plan staging changes
make apply-staging    # Apply staging changes
make build           # Build Docker images
make up              # Start containers
make logs            # View logs
make test            # Run all tests
make deploy-staging  # Trigger staging deployment (via git)
make ssh-staging     # SSH to staging instance
make health          # Check health
make clean           # Clean Docker resources
```

## Deployment Workflow

### For Staging (develop branch)

```bash
# 1. Make changes
git checkout develop
# ... make changes ...

# 2. Commit and push
git add .
git commit -m "Feature: Add new feature"
git push origin develop

# 3. Monitor
# - Check GitHub Actions → deploy-staging workflow
# - Wait for completion

# 4. Verify
STAGING_IP=$(cd terraform/environments/staging && terraform output -raw instance_public_ip)
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP
docker-compose ps
```

### For Production (main branch)

```bash
# 1. Ensure all tests pass on develop
# 2. Create pull request develop → main
# 3. Get approval
# 4. Merge to main
git checkout main
git pull origin develop
git push origin main

# 5. Monitor
# - Check GitHub Actions → deploy-production workflow
# - Wait for tests to pass
# - Verify deployment

# 6. Verify
PROD_IP=$(cd terraform/environments/production && terraform output -raw instance_public_ip)
ssh -i ~/.ssh/id_communityboard ubuntu@$PROD_IP
docker-compose -f docker-compose.production.yml ps
```

## Troubleshooting Quick Fixes

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check resources
docker stats
df -h
```

### Can't SSH to EC2

```bash
# Check security group
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Add your IP if missing
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Verify key permissions
chmod 600 ~/.ssh/id_communityboard
```

### Database connection error

```bash
# Check if database is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d communityboard

# Restart database
docker-compose restart postgres
```

### Out of disk space

```bash
# Check usage
df -h

# Clean Docker
docker system prune -a

# Remove old volumes
docker volume prune
```

### Port already in use

```bash
# Check what's using the port
lsof -i :8080
netstat -tlnp | grep :8080

# Kill process or change docker-compose port mapping
```

## Emergency Contacts & Resources

| Issue | Who to Contact | Action |
|-------|---|---|
| AWS Access | Cloud Admin | Generate new credentials |
| Database Corruption | Database Admin | Restore from backup |
| Security Breach | Security Team | Begin incident response |
| EC2 Outage | Infrastructure Team | Check AWS status page |

## Reference Documentation

- [DEVOPS.md](DEVOPS.md) - Full DevOps guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checks
- [GITHUB_SECRETS.md](GITHUB_SECRETS.md) - GitHub secrets setup
- [terraform/SETUP.md](terraform/SETUP.md) - Terraform setup details

## Cost Monitoring

```bash
# Estimate monthly costs
# Staging: t3.small ≈ $0.02/hour ≈ $15/month
# Production: t3.medium ≈ $0.04/hour ≈ $30/month
# Total ≈ $45-50/month + data transfer

# Check AWS billing
# 1. Go to AWS Console → Billing Dashboard
# 2. View current month spend
# 3. Set up budget alerts
```

## Performance Tips

1. **Use `docker-compose pull` before `docker-compose up`** to avoid rebuilding
2. **Cache Docker layers** by putting frequently-changed commands last in Dockerfile
3. **Use multi-stage builds** to reduce final image size
4. **Compress database backups**: `gzip db-backup.sql`
5. **Monitor CloudWatch** for performance metrics

## Security Reminders

✓ Never commit `.env` files with real secrets
✓ Rotate secrets every 90 days
✓ Use strong passwords (>16 characters)
✓ Enable AWS CloudTrail for audit logging
✓ Keep EC2 security groups restrictive
✓ Use SSH keys instead of passwords
✓ Regular security updates (`apt-get update && apt-get upgrade`)
