#!/bin/bash
set -e

# Community Board DevOps Setup Script
# This script helps set up the DevOps infrastructure for AWS deployment

echo "=========================================="
echo "Community Board DevOps Setup"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}✗ $1 not found${NC}"
        return 1
    else
        version=$("$1" --version 2>&1 | head -n1)
        echo -e "${GREEN}✓ $1 installed${NC}: $version"
        return 0
    fi
}

check_command "terraform" || { echo "Please install Terraform"; exit 1; }
check_command "docker" || { echo "Please install Docker"; exit 1; }
check_command "docker-compose" || { echo "Please install Docker Compose"; exit 1; }
check_command "aws" || { echo "Please install AWS CLI"; exit 1; }
check_command "git" || { echo "Please install Git"; exit 1; }

echo ""
echo "=========================================="
echo "Step 1: AWS Configuration"
echo "=========================================="

read -p "Enter your AWS profile name [default]: " aws_profile
aws_profile=${aws_profile:-default}

echo "Using AWS profile: $aws_profile"
aws sts get-caller-identity --profile "$aws_profile" || { 
    echo -e "${RED}AWS credentials not configured properly${NC}"
    exit 1
}

echo -e "${GREEN}✓ AWS configured${NC}"
echo ""

# SSH Key Setup
echo "=========================================="
echo "Step 2: SSH Key Setup"
echo "=========================================="

ssh_key_path="$HOME/.ssh/id_communityboard"

if [ ! -f "$ssh_key_path" ]; then
    echo "Creating SSH key pair..."
    ssh-keygen -t ed25519 -f "$ssh_key_path" -N "" -C "devops@communityboard"
    chmod 600 "$ssh_key_path"
    echo -e "${GREEN}✓ SSH key created at $ssh_key_path${NC}"
else
    echo -e "${YELLOW}SSH key already exists at $ssh_key_path${NC}"
fi

# Display public key
echo ""
echo "Your public SSH key:"
cat "$ssh_key_path.pub"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "=========================================="
echo "Step 3: Terraform Variables"
echo "=========================================="

read -p "Enter your IP address for SSH access (CIDR format, e.g., 203.0.113.42/32): " user_ip
read -p "Enter AWS region [eu-north-1]: " aws_region
aws_region=${aws_region:-eu-north-1}

public_key=$(cat "$ssh_key_path.pub")

echo ""
echo "Staging Configuration:"
cat > terraform/environments/staging/staging.tfvars <<EOF
aws_region     = "$aws_region"
instance_type  = "t3.small"
root_volume_size = 30
ssh_allowed_ip = "$user_ip"
public_key     = "$public_key"
EOF
echo -e "${GREEN}✓ Created staging.tfvars${NC}"

echo ""
echo "Production Configuration:"
cat > terraform/environments/production/production.tfvars <<EOF
aws_region     = "$aws_region"
instance_type  = "t3.medium"
root_volume_size = 50
ssh_allowed_ip = "$user_ip"
public_key     = "$public_key"
EOF
echo -e "${GREEN}✓ Created production.tfvars${NC}"

echo ""
echo "=========================================="
echo "Step 4: Environment Variables"
echo "=========================================="

# Generate secure secrets
db_password=$(openssl rand -base64 32)
jwt_secret=$(openssl rand -base64 32)

echo ""
echo "Staging Environment:"
cat > .env.staging <<EOF
DB_NAME=communityboard
DB_USER=postgres
DB_PASSWORD=$db_password
SPRING_PROFILES=staging
JWT_SECRET=$jwt_secret
REACT_APP_API_URL=http://staging.example.com
COMPOSE_PROJECT_NAME=communityboard-staging
EOF
echo -e "${GREEN}✓ Created .env.staging${NC}"
echo "Important: Update REACT_APP_API_URL with your staging IP"

echo ""
echo "Production Environment (template):"
cat > .env.production.template <<EOF
DB_NAME=communityboard
DB_USER=postgres
DB_PASSWORD=CHANGE_ME
SPRING_PROFILES=production
JWT_SECRET=CHANGE_ME
REACT_APP_API_URL=https://api.example.com
COMPOSE_PROJECT_NAME=communityboard-production
EOF
echo -e "${GREEN}✓ Created .env.production.template${NC}"
echo "Important: Set these as GitHub Secrets, do not commit .env.production"

echo ""
echo "=========================================="
echo "Step 5: GitHub Secrets Setup"
echo "=========================================="

echo "Add these secrets to GitHub repository (Settings → Secrets):"
echo ""
echo "Docker Registry:"
echo "  DOCKER_USERNAME: your-docker-username"
echo "  DOCKER_PASSWORD: your-docker-token"
echo ""
echo "Staging:"
echo "  STAGING_EC2_HOST: (will be available after terraform apply)"
echo "  STAGING_EC2_USER: ubuntu"
echo "  EC2_DEPLOY_KEY: (contents of $ssh_key_path)"
echo ""
echo "Database & Secrets:"
echo "  Staging DB Password: $db_password"
echo "  Staging JWT Secret: $jwt_secret"
echo ""

read -p "Press Enter to continue..."

echo ""
echo "=========================================="
echo "Step 6: Initialize Terraform"
echo "=========================================="

read -p "Initialize Terraform for staging? (y/n) [y]: " init_staging
init_staging=${init_staging:-y}

if [ "$init_staging" = "y" ]; then
    cd terraform/environments/staging
    terraform init -upgrade
    cd ../../..
    echo -e "${GREEN}✓ Terraform initialized for staging${NC}"
fi

echo ""
echo "=========================================="
echo "Step 7: Review Infrastructure"
echo "=========================================="

if [ "$init_staging" = "y" ]; then
    cd terraform/environments/staging
    echo "Running Terraform plan for staging..."
    terraform plan -var-file="staging.tfvars" > /tmp/tf-plan.txt
    echo ""
    echo "Plan saved. Review with: terraform plan -var-file=\"staging.tfvars\""
    echo ""
    read -p "Apply infrastructure? (y/n) [n]: " apply_staging
    
    if [ "$apply_staging" = "y" ]; then
        terraform apply -var-file="staging.tfvars"
        
        echo ""
        echo "Saving outputs..."
        terraform output -json > /tmp/terraform-outputs.json
        
        staging_ip=$(terraform output -raw instance_public_ip)
        echo -e "${GREEN}✓ Staging EC2 IP: $staging_ip${NC}"
    fi
    
    cd ../../..
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Add EC2 instance IP to GitHub Secrets"
echo "2. Configure Docker Hub credentials in GitHub Secrets"
echo "3. Push code to develop branch to trigger staging deployment"
echo "4. Monitor deployment in GitHub Actions"
echo ""
echo "For detailed documentation, see DEVOPS.md"
