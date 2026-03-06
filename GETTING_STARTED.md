# 🚀 Getting Started - Production DevOps Setup

A 5-minute quick start to begin using your production-ready DevOps infrastructure.

## Step 1: Prerequisites Check (2 minutes)

```bash
# Verify all required tools are installed
terraform --version          # Should be >= 1.5.0
docker --version            # Should be >= 24.0
docker-compose --version    # Should be >= 2.20
aws --version               # AWS CLI v2
aws sts get-caller-identity # Verify AWS credentials

# Generate SSH key (if not already done)
ssh-keygen -t ed25519 -f ~/.ssh/id_communityboard -N ""
```

## Step 2: Automated Setup (3 minutes)

**Recommended: Run the automated setup script**

```bash
cd Community-team1
bash devops-setup.sh

# The script will:
# 1. Verify prerequisites
# 2. Configure AWS credentials
# 3. Generate SSH key pair
# 4. Create Terraform variables files
# 5. Generate secure database passwords
# 6. Initialize Terraform (optionally)
```

**OR: Manual Setup**

```bash
# If you prefer manual setup, see DEVOPS.md
nano terraform/environments/staging/staging.tfvars

# Update:
# - ssh_allowed_ip: your-ip/32 (from: curl icanhazip.com)
# - public_key: (from: cat ~/.ssh/id_communityboard.pub)

cd terraform/environments/staging
terraform init
terraform plan -var-file="staging.tfvars"
terraform apply -var-file="staging.tfvars"
```

## Step 3: GitHub Configuration (2 minutes)

1. **Go to your GitHub repository**
   - Settings → Secrets and variables → Actions

2. **Add Docker Registry Secrets**
   ```
   DOCKER_USERNAME = your-docker-hub-username
   DOCKER_PASSWORD = your-docker-hub-token
   ```
   
   Get token: https://hub.docker.com/settings/security

3. **Add EC2 & Deployment Secrets**

   After Terraform deployment, run:
   ```bash
   cd terraform/environments/staging
   terraform output instance_public_ip  # Copy this IP
   ```
   
   Add to GitHub Secrets:
   ```
   STAGING_EC2_HOST = <IP from above>
   STAGING_EC2_USER = ubuntu
   EC2_DEPLOY_KEY = <contents of ~/.ssh/id_communityboard>
   ```

4. **Add Database & Application Secrets**
   
   From devops-setup.sh output, copy passwords:
   ```
   STAGING_DB_PASSWORD = <from setup script>
   STAGING_JWT_SECRET = <from setup script>
   STAGING_API_URL = http://<staging-IP>:8080
   ```

   For production, create your own strong passwords.

   See [GITHUB_SECRETS.md](GITHUB_SECRETS.md) for complete list.

## Step 4: Test Deployment (1 minute)

```bash
# Test staging deployment
git checkout develop
git commit --allow-empty -m "Test deployment"
git push origin develop

# Monitor deployment:
# 1. Go to GitHub → Actions tab
# 2. Watch deploy-staging workflow
# 3. Check logs in real-time
```

## Step 5: Verify Deployment

Once deployment completes (5-10 minutes):

```bash
# SSH into instance
STAGING_IP=$(cd terraform/environments/staging && terraform output -raw instance_public_ip)
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP

# Check containers
docker ps
docker-compose ps

# View logs
docker-compose logs backend

# Test application
curl http://localhost:8080/actuator/health
```

## Step 6: Production Deployment

When ready for production:

```bash
# 1. Create PR from develop → main
git checkout main
git pull origin develop
git push origin -u main

# 2. Let tests run in GitHub Actions
# 3. Merge if all tests pass
# 4. Application automatically deploys to production
```

## Common Commands

### Using Makefile (Recommended)

```bash
make help              # See all available commands
make plan-staging      # Preview staging changes
make apply-staging     # Deploy staging infrastructure
make build            # Build Docker images locally
make up               # Start containers
make logs             # View application logs
make test             # Run all tests
make ssh-staging      # SSH to staging instance
make health           # Check application health
make clean            # Clean Docker resources
```

### Direct Commands

```bash
# Terraform
terraform plan -var-file="staging.tfvars"
terraform apply -var-file="staging.tfvars"
terraform destroy -var-file="staging.tfvars"

# Docker Compose
docker-compose -f docker-compose.staging.yml up -d
docker-compose -f docker-compose.staging.yml logs -f backend
docker-compose -f docker-compose.staging.yml down

# GitHub Actions
git push origin develop          # Trigger staging deployment
git push origin main             # Trigger production deployment
```

## 📊 Expected Timeline

| Step | Duration | Action |
|------|----------|--------|
| 1 | 2 min | Verify prerequisites |
| 2a | 3 min | Run automated setup script |
| 2b | 5 min | Apply Terraform |
|  | 5-10 min | EC2 initialization (while you configure GitHub) |
| 3 | 2 min | Add GitHub secrets |
| 4 | 5 min | Push to develop |
| 4 | 5-10 min | GitHub Actions builds & deploys |
| 5 | 1 min | Verify deployment |
| **Total** | **~25-30 min** | **Complete setup** |

## 🔍 Verify Everything Works

```bash
# 1. Check Terraform outputs
cd terraform/environments/staging
terraform output

# 2. SSH to instance and verify
ssh -i ~/.ssh/id_communityboard ubuntu:<IP>
docker-compose ps

# 3. Check frontend loads
curl -v http://<IP>:3000/index.html

# 4. Check backend health
curl http://<IP>:8080/actuator/health | jq .

# 5. Test application
# Open in browser: http://<IP>:3000
```

## ✅ Success Checklist

- [ ] Prerequisites installed and verified
- [ ] SSH key generated and added to Terraform
- [ ] Terraform initialized for staging
- [ ] Terraform infrastructure deployed
- [ ] GitHub secrets configured
- [ ] Docker credentials verified
- [ ] EC2 instance running and accessible
- [ ] Containers started successfully
- [ ] Frontend accessible via browser
- [ ] Backend health check passing
- [ ] Application working end-to-end

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **Terraform init fails** | Check AWS credentials: `aws sts get-caller-identity` |
| **Can't SSH to EC2** | Check your IP in security group, add if needed |
| **Containers won't start** | Check logs: `docker-compose logs backend` |
| **Database won't connect** | Wait 30 seconds, check health: `docker-compose ps` |
| **GitHub Actions fails** | Check secrets are correctly named in GitHub |
| **Out of disk space** | Run: `docker system prune -a` |

## 📚 Full Documentation

For detailed information, see:

| Document | When to Use |
|----------|------------|
| [DEVOPS_README.md](DEVOPS_README.md) | Overview & architecture |
| [DEVOPS.md](DEVOPS.md) | Complete setup guide |
| [GITHUB_SECRETS.md](GITHUB_SECRETS.md) | GitHub configuration |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Common commands |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Before deployment |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What was created |

## 💡 Tips

1. **Use Makefile** - All common operations available as simple commands
2. **Read QUICK_REFERENCE.md** - Most answers are there
3. **Check GitHub Actions logs** - Best way to debug deployments
4. **Keep backups of secrets** - Store GitHub secrets securely
5. **Monitor CloudWatch** - Set up alarms for production
6. **Test staging first** - Always verify in staging before production

## 🎯 Next Tasks

After successful setup:

1. ✅ **Configure monitoring** - Set up CloudWatch alerts
2. ✅ **Plan infrastructure** - Decide on additional resources
3. ✅ **Set up backups** - Database backup strategy
4. ✅ **Security hardening** - See "Security Hardening Todo" in DEVOPS.md
5. ✅ **Cost optimization** - Monitor and optimize AWS spend

## 📞 Need Help?

1. **Setup issues?** → `bash devops-setup.sh` with `-h` flag for help
2. **Terraform issues?** → See `terraform/SETUP.md`
3. **Deployment issues?** → Check GitHub Actions logs
4. **Database issues?** → Run: `docker-compose exec postgres psql -U postgres -d communityboard`
5. **Still stuck?** → Check `DEVOPS.md` troubleshooting section

---

## 🚀 Ready to Deploy?

```bash
# 1. Make sure everything is ready
make validate              # Validate Terraform
make test                 # Run all tests

# 2. Deploy to staging
git push origin develop
# Monitor: GitHub Actions tab

# 3. If everything looks good, deploy to production
git checkout main
git merge develop
git push origin main
# Monitor: GitHub Actions tab

# 4. Verify production
PROD_IP=$(cd terraform/environments/production && terraform output -raw instance_public_ip)
ssh -i ~/.ssh/id_communityboard ubuntu@$PROD_IP
docker-compose -f docker-compose.production.yml ps
```

**You're all set! Happy deploying! 🎉**
