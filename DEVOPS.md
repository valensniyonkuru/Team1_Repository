# DevOps Setup Guide - Community Board

This guide provides a comprehensive setup for deploying the Community Board application to AWS EC2 using Terraform, Docker, and GitHub Actions.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Local Setup](#local-setup)
4. [Infrastructure Setup](#infrastructure-setup)
5. [CI/CD Configuration](#cicd-configuration)
6. [Deployment](#deployment)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

## Architecture Overview

### Infrastructure Stack
- **Region**: eu-north-1 (Stockholm)
- **Compute**: EC2 t3.medium (production) / t3.small (staging)
- **Database**: PostgreSQL 15 (containerized)
- **Container Orchestration**: Docker Compose
- **IaC**: Terraform with remote backend (S3 + DynamoDB)
- **CI/CD**: GitHub Actions
- **Registry**: Docker Hub (configurable)

### Environment Topology

```
┌─────────────────────────────────────────────────────────┐
│                     Internet (0.0.0.0/0)                │
└────────────────────────┬────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │   IGW    │
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼──┐         ┌──▼──┐      ┌───▼───┐
    │ HTTP  │         │HTTPS│      │SSH 22 │ (restricted)
    │       │         │     │      │       │
    └───┬───┘         └──┬──┘      └───┬───┘
        │                │            │
        └────────────────┼────────────┘
                         │
                 ┌───────▼──────────┐
                 │  Security Group  │
                 │   (dynamically   │
                 │   configured)    │
                 └───────┬──────────┘
                         │
                    ┌────▼──────────────────┐
                    │   EC2 Instance        │
                    │  (Ubuntu 22.04 LTS)   │
                    └────┬──────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼─────┐    ┌────▼─────┐   ┌───▼────┐
    │ Backend   │    │ Frontend  │   │Database│
    │ (Spring)  │    │ (React)   │   │(Postgres)
    │ :8080     │    │ :3000     │   │:5432   │
    └───────────┘    └───────────┘   └────────┘
```

## Prerequisites

### Local Environment

- **AWS Account** with appropriate permissions:
  - EC2 full access
  - VPC full access
  - IAM for key pair management
  - S3 for Terraform state (optional but recommended)
  - DynamoDB for state locking (optional)

- **Tools**:
  - [Terraform](https://www.terraform.io/downloads.html) >= 1.5.0
  - [Docker](https://docs.docker.com/get-docker/) >= 24.0
  - [Docker Compose](https://docs.docker.com/compose/install/) >= 2.20
  - [AWS CLI](https://aws.amazon.com/cli/) v2
  - [OpenSSH](https://www.openssh.com/) client
  - [Git](https://git-scm.com/)
  - [JDK 17](https://www.oracle.com/java/technologies/downloads/#java17) (for local development)
  - [Node.js 18](https://nodejs.org/) (for local development)

- **SSH Key Pair**:
  ```bash
  ssh-keygen -t ed25519 -f ~/.ssh/id_communityboard -C "devops@communityboard"
  # Add to ssh-agent: ssh-add ~/.ssh/id_communityboard
  ```

### AWS Configuration

1. Configure AWS credentials:
   ```bash
   aws configure
   # Enter: Access Key ID, Secret Access Key, region (eu-north-1), output (json)
   ```

2. Verify access:
   ```bash
   aws sts get-caller-identity
   ```

## Local Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Community-team1
```

### 2. Development Environment

#### Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
# App runs on http://localhost:8080
```

#### Frontend (React)

```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
# API proxy: http://localhost:8080
```

#### Using Docker Locally

```bash
# Development with live reload
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### 3. Environment Variables

```bash
# Copy example files
cp .env.staging.example .env.local
cp .env.production.example .env.prod.example

# Edit with your values
nano .env.local
```

## Infrastructure Setup

### Step 1: AWS Infrastructure with Terraform

#### Initialize Terraform

```bash
cd terraform/environments/staging

# Configure your values
nano staging.tfvars
# Update:
# - ssh_allowed_ip: your IP (e.g., 203.0.113.42/32)
# - public_key: content of ~/.ssh/id_communityboard.pub

# Initialize
terraform init

# Plan
terraform plan -var-file="staging.tfvars"

# Apply
terraform apply -var-file="staging.tfvars"
```

**Terraform Outputs**:
- `instance_public_ip`: EC2 instance public IP
- `instance_id`: EC2 instance ID
- `security_group_id`: Security group ID

#### Production Setup

```bash
cd terraform/environments/production
nano production.tfvars
terraform init
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"
```

#### Remote Backend Setup (Optional but Recommended)

```bash
# Create S3 buckets and DynamoDB tables (see terraform/SETUP.md)
# Then uncomment backend blocks in main.tf files
# Reinitialize: terraform init -migrate-state
```

### Step 2: SSH Access to EC2

```bash
# Get instance IP from Terraform output
STAGING_IP=$(terraform output -raw instance_public_ip)

# Test SSH access
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP

# Add to known_hosts
ssh-keyscan -H $STAGING_IP >> ~/.ssh/known_hosts

# User setup on instance (one-time)
# The user_data.sh script already configured 'appuser'
# You as ubuntu can access and manage
```

### Step 3: Initial Deployment

```bash
# SSH into instance
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP

# Switch to appuser
sudo su - appuser

# Navigate to app directory
cd /opt/app

# Create .env file with secrets
cat > .env <<'EOF'
DB_NAME=communityboard
DB_USER=postgres
DB_PASSWORD=your-secure-password
SPRING_PROFILES=staging
JWT_SECRET=your-jwt-secret
REACT_APP_API_URL=http://$(hostname -I | awk '{print $1}'):3000
EOF

# Create docker-compose symlink
ln -s /path/to/docker-compose.staging.yml docker-compose.yml

# Pull and start services
docker-compose pull
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend
```

## CI/CD Configuration

### Step 1: GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Docker Registry
```
DOCKER_USERNAME: your-docker-username
DOCKER_PASSWORD: your-docker-hub-token
```

#### Staging Environment
```
STAGING_EC2_HOST: staging-instance-public-ip
STAGING_EC2_USER: ubuntu
EC2_DEPLOY_KEY: (contents of ~/.ssh/id_communityboard)

STAGING_DB_NAME: communityboard
STAGING_DB_USER: postgres
STAGING_DB_PASSWORD: your-secure-password
STAGING_JWT_SECRET: your-jwt-secret-staging
STAGING_API_URL: http://staging-instance-ip:8080
```

#### Production Environment
```
PRODUCTION_EC2_HOST: production-instance-public-ip
PRODUCTION_EC2_USER: ubuntu

PRODUCTION_DB_NAME: communityboard
PRODUCTION_DB_USER: postgres
PRODUCTION_DB_PASSWORD: your-secure-password
PRODUCTION_JWT_SECRET: your-jwt-secret-prod
PRODUCTION_API_URL: https://api.example.com
```

### Step 2: Workflow Files

Located in `.github/workflows/`:

- **deploy-staging.yml**: Triggers on push to `develop` branch
  - Builds Docker images
  - Pushes to Docker Hub
  - Deploys to staging EC2
  
- **deploy-production.yml**: Triggers on push to `main` branch
  - Runs tests (backend + frontend)
  - Builds Docker images
  - Pushes with version tags
  - Deploys to production EC2
  - Creates GitHub release

- **test-pr.yml**: Triggers on pull requests
  - Runs backend tests (Maven)
  - Runs frontend tests (Jest)
  - Runs security scanning (Trivy)

### Step 3: Branch Protection

1. Go to GitHub repo → Settings → Branches
2. Add protection rule for `main`:
   - Require PR reviews
   - Require status checks to pass
   - Include administrators

## Deployment

### Manual Deployment

#### Staging (develop branch)

```bash
git checkout develop
git commit -am "Update feature"
git push origin develop
# GitHub Actions automatically deploys to staging
```

#### Production (main branch)

```bash
git checkout main
git merge develop
git push origin main
# Tests → Build → Deploy to production
```

### Manual SSH Deployment (Emergency)

```bash
PROD_IP="your-prod-instance-ip"
ssh -i ~/.ssh/id_communityboard ubuntu@$PROD_IP

# As appuser
sudo su - appuser
cd /opt/app

# Update .env with new secrets if needed
nano .env

# Pull and redeploy
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Verify
docker-compose -f docker-compose.production.yml logs -f backend
```

## Monitoring & Troubleshooting

### EC2 Instance Monitoring

```bash
# SSH into instance
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP

# Container status
docker ps
docker-compose -f docker-compose.staging.yml ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Resource usage
docker stats

# Database connection
docker-compose exec postgres psql -U postgres -d communityboard -c "SELECT version();"
```

### Common Issues

#### 1. SSH Connection Refused
```bash
# Verify security group rules
aws ec2 describe-security-groups \
  --region eu-north-1 \
  --filters "Name=group-name,Values=staging-app-sg"

# Update if needed
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32
```

#### 2. Docker Compose Fails to Start
```bash
docker-compose logs
docker-compose ps
docker system df  # Check disk space
docker system prune -a  # Clean up if needed
```

#### 3. Database Connection Issues
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U postgres -d communityboard
# Check: \du (users) \dt (tables) \l (databases)
```

#### 4. Backend Health Check Failure
```bash
docker-compose logs backend
# Check: logs for connection errors
curl http://localhost:8080/actuator/health
```

#### 5. Out of Disk Space

```bash
# SSH to instance
ssh -i ~/.ssh/id_communityboard ubuntu@$STAGING_IP
df -h

# Clean Docker
docker system prune -a -f
docker volume prune -f

# Check PostgreSQL data size
du -sh /var/lib/docker/volumes/*/

# If critical, increase volume in Terraform (requires restart)
```

### Cleanup

#### Remove Staging Infrastructure
```bash
cd terraform/environments/staging
terraform destroy -var-file="staging.tfvars"
```

#### Remove All Images
```bash
ssh ubuntu@$STAGING_IP
docker-compose down
docker system prune -a -f
```

## Architecture Decisions

### Why These Choices?

1. **Terraform**: Infrastructure as Code, version control, reproducible environments
2. **EC2 with Docker Compose**: Simpler than ECS, full control, cost-effective for small apps
3. **Multi-stage Docker builds**: Smaller images, faster deployments, better security
4. **Non-root user**: Security best practice, prevents container escapes
5. **GitHub Actions**: Free tier sufficient, native GitHub integration, no extra platform
6. **Remote backend**: Team collaboration, state locking, audit trail

### Cost Optimization

- Staging: t3.small (~$0.02/hour) = ~$15/month
- Production: t3.medium (~$0.04/hour) = ~$30/month
- Total: ~$45/month (plus storage, data transfer)

### Security Hardening Todo

- [ ] Use AWS Secrets Manager instead of environment variables
- [ ] Enable VPC Flow Logs for network monitoring
- [ ] Set up CloudWatch alarms for cost/performance
- [ ] Use private subnets with NAT gateway for better isolation
- [ ] Implement auto-scaling with load balancer
- [ ] Enable S3 versioning for Terraform state
- [ ] Use SSL/TLS certificates (AWS Certificate Manager)

## Support & Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
