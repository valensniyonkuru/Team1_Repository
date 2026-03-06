# Production-Ready DevOps Infrastructure for Community Board

A complete, enterprise-grade DevOps setup for deploying the Community Board application to AWS EC2 in the eu-north-1 region.

## 📋 What's Included

### ✅ Infrastructure as Code (Terraform)
- **Modular design** with reusable network and EC2 modules
- **Multi-environment support** (staging & production)
- **VPC with public subnet**, Internet Gateway, Security Groups
- **EC2 instances** with Ubuntu 22.04 LTS, EBS encryption, monitoring
- **Elastic IPs** for static public addresses
- **CloudWatch logging** for centralized monitoring
- **Remote backend** ready (S3 + DynamoDB state locking)

### 🐳 Docker & Container Optimization
- **Multi-stage builds** for Backend (Spring Boot), Frontend (React), and ETL (Python)
- **Non-root user** execution for security
- **Production-grade images** optimized for size and performance
- **Health checks** for all services
- **Proper logging configuration** (JSON logs, rotation)
- **Environment-variable support** with `.env` files

### 🚀 CI/CD Pipeline (GitHub Actions)
- **Branch-based deployments**:
  - `develop` → Staging (t3.small)
  - `main` → Production (t3.medium)
- **Automated testing** (backend + frontend)
- **Docker image building** and push to registry
- **SSH deployment** to EC2 with health checks
- **Automated rollback** capability
- **Release management** with version tags
- **Security scanning** with Trivy

### 📊 Monitoring & Observability
- **Container health checks** with restart policies
- **CloudWatch log groups** per environment
- **Docker stats** monitoring
- **Application logs** centralized
- **PostgreSQL** with persistence volumes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Frontend   │  │   Backend    │  │   Data Engineering       │  │
│  │   (React)    │  │ (Spring Boot)│  │   (Python ETL)           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│         ↓                ↓                       ↓                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              GitHub Actions (CI/CD Pipeline)                   │ │
│  │  • Test  • Build  • Push to Registry  • Deploy to EC2         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────────┘
                     │
         ┌───────────┴────────────┬──────────────┐
         │                        │              │
    ┌────▼─────┐          ┌──────▼────┐   ┌────▼────┐
    │ Terraform │          │Docker Hub  │   │ ECR/GCR │
    │  (IaC)    │          │(optional)  │   │(optional)
    └────┬─────┘          └─────┬──────┘   └────┬────┘
         │                      │              │
    ┌────▼──────────────────────▼──────────────▼─────────┐
    │           AWS Region (eu-north-1)                  │
    │  ┌────────────────────────────────────────────┐   │
    │  │  VPC (10.0.0.0/16 or 10.1.0.0/16)         │   │
    │  │  ┌──────────────────────────────────────┐ │   │
    │  │  │  Public Subnet (10.0.1.0/24)         │ │   │
    │  │  │  ┌────────────────────────────────┐ │ │   │
    │  │  │  │  EC2 Instance (Ubuntu 22.04)   │ │ │   │
    │  │  │  │  ┌────────────────────────────┐│ │ │   │
    │  │  │  │  │ Docker Compose             ││ │ │   │
    │  │  │  │  │ ┌─────────┐ ┌─────────┐   ││ │ │   │
    │  │  │  │  │ │Backend  │ │Frontend │   ││ │ │   │
    │  │  │  │  │ │:8080    │ │:3000    │   ││ │ │   │
    │  │  │  │  │ └─────────┘ └─────────┘   ││ │ │   │
    │  │  │  │  │ ┌──────────────────────┐  ││ │ │   │
    │  │  │  │  │ │PostgreSQL:5432       │  ││ │ │   │
    │  │  │  │  │ │tnav5FSABC            │  ││ │ │   │
    │  │  │  │  │ └──────────────────────┘  ││ │ │   │
    │  │  │  │  └────────────────────────────┘│ │ │   │
    │  │  │  │  Elastic IP (Static)           │ │ │   │
    │  │  │  └────────────────────────────────┘ │ │   │
    │  │  │  ┌────────────────────────────────┐ │ │   │
    │  │  │  │ Security Group                 │ │ │   │
    │  │  │  │ • SSH (22) - Restricted IP    │ │ │   │
    │  │  │  │ • HTTP (80) - 0.0.0.0/0       │ │ │   │
    │  │  │  │ • HTTPS (443) - 0.0.0.0/0     │ │ │   │
    │  │  │  │ • App (8080) - 0.0.0.0/0      │ │ │   │
    │  │  │  └────────────────────────────────┘ │ │   │
    │  │  └──────────────────────────────────────┘ │   │
    │  └────────────────────────────────────────────┘   │
    └────────────────────────────────────────────────────┘
                          ↓
    ┌────────────────────────────────────────────────────┐
    │        CloudWatch Monitoring & Logging             │
    └────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
Community-team1/
├── terraform/                           # Infrastructure as Code
│   ├── modules/
│   │   ├── network/                    # VPC, subnets, security groups
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   └── ec2/                        # EC2 instances, monitoring
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       ├── outputs.tf
│   │       └── user_data.sh            # Initial setup script
│   ├── environments/
│   │   ├── staging/
│   │   │   ├── main.tf                 # Module composition
│   │   │   ├── variables.tf            # Input variables
│   │   │   ├── outputs.tf              # Output values
│   │   │   ├── staging.tfvars          # Variable values (gitignored)
│   │   │   └── staging.tfvars.example  # Template for variables
│   │   └── production/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       ├── outputs.tf
│   │       ├── production.tfvars       # Variable values (gitignored)
│   │       └── production.tfvars       # Template for variables
│   └── SETUP.md                        # Terraform setup guide
│
├── .github/
│   └── workflows/
│       ├── deploy-staging.yml          # develop → staging deployment
│       ├── deploy-production.yml       # main → production deployment
│       └── test-pr.yml                 # PR testing & security scan
│
├── backend/                            # Spring Boot Application
│   ├── Dockerfile.prod                 # Multi-stage production build
│   ├── .dockerignore
│   └── ... (existing backend code)
│
├── frontend/                           # React Application
│   ├── Dockerfile.prod                 # Multi-stage production build
│   ├── nginx.conf                      # Nginx configuration
│   ├── .dockerignore
│   └── ... (existing frontend code)
│
├── data-engineering/                   # Python ETL Pipeline
│   ├── Dockerfile.prod                 # Multi-stage production build
│   ├── .dockerignore
│   └── ... (existing ETL code)
│
├── devops/                             # DevOps scripts
│   └── scripts/
│       └── deploy.sh                   # Deployment automation
│
├── docker-compose.staging.yml          # Staging environment stack
├── docker-compose.production.yml       # Production environment stack
│
├── .env.staging.example                # Staging environment template
├── .env.production.example             # Production environment template
│
├── devops-setup.sh                     # One-time setup automation
├── Makefile                            # Convenient operation commands
│
├── DEVOPS.md                           # Complete DevOps guide
├── DEPLOYMENT_CHECKLIST.md             # Pre-deployment verification
├── GITHUB_SECRETS.md                   # GitHub secrets configuration
├── QUICK_REFERENCE.md                  # Common commands quick reference
└── .gitignore                          # Git ignore (secrets & builds)
```

## 🚀 Quick Start

### 1. Prerequisites
- [Terraform](https://www.terraform.io/downloads.html) ≥ 1.5.0
- [Docker](https://docs.docker.com/get-docker/) ≥ 24.0  
- [AWS CLI](https://aws.amazon.com/cli/) v2 configured
- SSH key pair for EC2 access

### 2. Initial Setup (5 minutes)

```bash
# Run setup script (automated)
bash devops-setup.sh

# Or manually:
# 1. Edit terraform variables
nano terraform/environments/staging/staging.tfvars

# 2. Initialize Terraform
cd terraform/environments/staging
terraform init
terraform plan -var-file="staging.tfvars"
terraform apply -var-file="staging.tfvars"
```

### 3. Configure GitHub Secrets

Add these secrets to: Settings → Secrets and variables → Actions

**Registry Credentials:**
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

**Staging Environment:**
- `STAGING_EC2_HOST` (from Terraform output)
- `STAGING_EC2_USER` (ubuntu)
- `EC2_DEPLOY_KEY` (SSH private key)
- `STAGING_DB_PASSWORD`
- `STAGING_JWT_SECRET`

**Production Environment:**
- `PRODUCTION_EC2_HOST`
- `PRODUCTION_DB_PASSWORD`
- `PRODUCTION_JWT_SECRET`

See [GITHUB_SECRETS.md](GITHUB_SECRETS.md) for details.

### 4. Deploy

**Staging:**
```bash
git push origin develop
# GitHub Actions automatically deploys to staging
```

**Production:**
```bash
git checkout main
git merge develop
git push origin main
# Tests → Build → Deploy to production
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DEVOPS.md](DEVOPS.md) | Complete DevOps guide with architecture & troubleshooting |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre/post deployment verification checklist |
| [GITHUB_SECRETS.md](GITHUB_SECRETS.md) | GitHub secrets configuration guide |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Frequently used commands & tips |
| [terraform/SETUP.md](terraform/SETUP.md) | Terraform-specific setup (backend, variables) |

## 🎯 Key Features

✅ **Production-Ready**
- Multi-stage Docker builds for optimal image size
- Non-root user execution for security
- Health checks on all services
- Automatic restart policies
- Environment isolation (staging vs production)

✅ **Infrastructure as Code**
- Reproducible infrastructure
- Version-controlled configuration
- Separate environments with different specs
- Easy scaling and modifications
- Audit trail of all changes

✅ **Automated CI/CD**
- Branch-based deployments
- Automated testing before deployment
- Build once, deploy to multiple environments
- Version tagging and release management
- Rollback capability

✅ **High Availability Considerations**
- CloudWatch monitoring and logging
- Elastic IP for static addressing
- Auto-restart on failures
- Database persistence with volumes
- Security group configuration

✅ **Security**
- Secrets management with GitHub Secrets
- Non-root containers
- SSH key-based access
- Restricted security groups
- Encrypted EBS volumes
- No hardcoded credentials

## 💰 Cost Estimate

| Component | Staging | Production | Monthly |
|-----------|---------|-----------|---------|
| t3.small EC2 | - | - | ~$15 |
| t3.medium EC2 | - | - | ~$30 |
| EBS Storage (30GB) | - | - | ~$3 |
| EBS Storage (50GB) | - | - | ~$5 |
| Data Transfer | - | - | ~$0-5 |
| **Total** | **~$15/mo** | **~$35-40/mo** | **~$50-55/mo** |

## 🔧 Common Operations

### Using Makefile

```bash
make help                 # Show all commands
make init                # Initialize Terraform
make plan-staging        # Plan staging changes
make apply-staging       # Apply staging infrastructure
make build              # Build Docker images
make up                 # Start containers
make logs               # View application logs
make test               # Run all tests
make ssh-staging        # SSH to staging instance
make health             # Check application health
```

### Manual Commands

```bash
# SSH to instance
STAGING_IP=$(cd terraform/environments/staging && terraform output -raw instance_public_ip)
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP

# View container logs
docker-compose logs -f backend

# Restart services
docker-compose down
docker-compose pull
docker-compose up -d

# Check health
curl http://localhost:8080/actuator/health
```

## 🐛 Troubleshooting

See [DEVOPS.md](DEVOPS.md#monitoring--troubleshooting) for detailed troubleshooting guide.

**Quick fixes:**
- Container won't start? → `docker-compose logs backend`
- Can't SSH? → Check security group and IP address
- Database issues? → `docker-compose exec postgres psql -U postgres -d communityboard`
- Out of disk? → `docker system prune -a`

## 📈 Monitoring & Alerts

### Local Monitoring
```bash
# Container stats
docker stats

# Application health
curl http://localhost:8080/actuator/health

# Database connection
docker-compose exec postgres psql -U postgres -d communityboard
```

### CloudWatch Monitoring
- Automatic log group creation: `/aws/ec2/{environment}/app`
- CPU, Memory, Disk usage tracking
- Custom metrics can be added
- Alarms can be configured (see DEVOPS.md)

## 🔐 Security Checklist

- [ ] SSH key pair generated and secured
- [ ] AWS credentials configured locally
- [ ] GitHub secrets configured (never commit `.env` files)
- [ ] Security group configured with restricted SSH access
- [ ] RDS passwords are strong (>16 characters)
- [ ] JWT secret is strong and unique per environment
- [ ] EC2 instance security updates applied
- [ ] CloudWatch logging enabled
- [ ] Auto-restart policies configured
- [ ] Database backups enabled

## 🚀 Next Steps

1. **Complete Initial Setup**
   - Run `bash devops-setup.sh` for automated setup
   - Or follow [DEVOPS.md](DEVOPS.md#infrastructure-setup)

2. **Configure GitHub Secrets**
   - Follow [GITHUB_SECRETS.md](GITHUB_SECRETS.md)
   - Test with staging deployment first

3. **Deploy to Staging**
   - Push changes to `develop` branch
   - Monitor GitHub Actions
   - Verify in browser

4. **Deploy to Production**
   - Create PR from `develop` to `main`
   - Get approval
   - Merge and push
   - Monitor and verify

5. **Ongoing Operations**
   - Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common tasks
   - Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) before each deployment
   - Monitor CloudWatch for issues

## 📞 Support

For issues or questions:
1. Check [DEVOPS.md](DEVOPS.md) for detailed documentation
2. Review [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common commands
3. Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for verification
4. Check GitHub Actions logs for deployment issues

## 📄 License

This DevOps infrastructure is part of the Community Board project.

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Status:** Production-Ready
