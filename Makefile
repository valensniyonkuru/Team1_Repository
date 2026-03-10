.PHONY: help init plan apply destroy test build deploy logs clean

# Makefile for Community Board DevOps Operations

## Environment Configuration
TERRAFORM_DIR := terraform
STAGING_ENV := staging
PROD_ENV := production
AWS_REGION := eu-north-1

help: ## Show this help message
	@echo "Community Board DevOps Operations"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ==================== Terraform Commands ====================

init: ## Initialize Terraform
	@echo "Initializing Terraform..."
	cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform init
	cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform init

init-hooks: ## Install Git pre-commit and commit-msg hooks
	@echo "Installing specialized Git hooks..."
	@mkdir -p .git/hooks
	@cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
	@cp scripts/git-hooks/commit-msg .git/hooks/commit-msg
	@chmod +x .git/hooks/pre-commit .git/hooks/commit-msg
	@echo "✅ Git hooks installed successfully (pre-commit, commit-msg)."


plan-staging: ## Plan staging infrastructure
	@echo "Planning staging infrastructure..."
	cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform plan -var-file="staging.tfvars"

plan-prod: ## Plan production infrastructure
	@echo "Planning production infrastructure..."
	cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform plan -var-file="production.tfvars"

apply-staging: ## Apply staging infrastructure
	@echo "Applying staging infrastructure..."
	cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform apply -var-file="staging.tfvars"

apply-prod: ## Apply production infrastructure (requires review)
	@echo "PRODUCTION DEPLOYMENT - Review plan first!"
	cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform plan -var-file="production.tfvars"
	@read -p "Press enter to continue with apply..." confirm
	cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform apply -var-file="production.tfvars"

destroy-staging: ## Destroy staging infrastructure
	@echo "WARNING: This will destroy staging infrastructure!"
	@read -p "Type 'yes' to confirm: " confirm && \
	if [ "$$confirm" = "yes" ]; then \
		cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform destroy -var-file="staging.tfvars"; \
	else \
		echo "Cancelled."; \
	fi

destroy-prod: ## Destroy production infrastructure (requires confirmation)
	@echo "WARNING: This will destroy PRODUCTION infrastructure!"
	@read -p "Type 'DESTROY PRODUCTION' to confirm: " confirm && \
	if [ "$$confirm" = "DESTROY PRODUCTION" ]; then \
		cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform destroy -var-file="production.tfvars"; \
	else \
		echo "Cancelled."; \
	fi

output-staging: ## Show staging outputs
	@cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform output

output-prod: ## Show production outputs
	@cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform output

# ==================== Docker Commands ====================

build: ## Build all Docker images
	@echo "Building Docker images..."
	docker-compose -f docker-compose.staging.yml build

build-prod: ## Build production Docker images
	@echo "Building production Docker images..."
	docker-compose -f docker-compose.production.yml build

up: ## Start containers (staging)
	@echo "Starting staging containers..."
	docker-compose -f docker-compose.staging.yml up -d

up-prod: ## Start containers (production)
	@echo "Starting production containers..."
	docker-compose -f docker-compose.production.yml up -d

down: ## Stop containers (staging)
	@echo "Stopping staging containers..."
	docker-compose -f docker-compose.staging.yml down

down-prod: ## Stop containers (production)
	@echo "Stopping production containers..."
	docker-compose -f docker-compose.production.yml down

ps: ## Show running containers (staging)
	@docker-compose -f docker-compose.staging.yml ps

ps-prod: ## Show running containers (production)
	@docker-compose -f docker-compose.production.yml ps

logs: ## Show application logs (staging)
	@docker-compose -f docker-compose.staging.yml logs -f backend

logs-prod: ## Show application logs (production)
	@docker-compose -f docker-compose.production.yml logs -f backend

# ==================== Testing Commands ====================

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd backend && mvn clean test

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd frontend && npm test -- --watchAll=false

test: test-backend test-frontend ## Run all tests

test-integration: ## Run integration tests
	@echo "Running integration tests..."
	cd backend && mvn clean verify

# ==================== Deployment Commands ====================

deploy-staging: ## Deploy to staging (requires git push to develop)
	@echo "Staging deployment triggered via GitHub Actions"
	@echo "Push to develop branch to trigger deployment"
	@echo "Monitor at: https://github.com/your-repo/actions"

deploy-prod: ## Deploy to production (requires git push to main)
	@echo "Production deployment triggered via GitHub Actions"
	@echo "Push to main branch to trigger deployment"
	@echo "Monitor at: https://github.com/your-repo/actions"

# ==================== Setup & Configuration ====================

setup: ## Run initial setup script
	@bash devops-setup.sh

config: ## Show all configuration
	@echo "=== Terraform Variables ==="
	@cat $(TERRAFORM_DIR)/environments/$(STAGING_ENV)/staging.tfvars
	@echo ""
	@echo "=== Environment Variables ==="
	@cat .env.staging 2>/dev/null || echo ".env.staging not found"

# ==================== Monitoring & Debugging ====================

ssh-staging: ## SSH into staging instance
	@staging_ip=$$(cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform output -raw instance_public_ip); \
	echo "Connecting to staging: $$staging_ip"; \
	ssh -i ~/.ssh/id_communityboard ubuntu@$$staging_ip

ssh-prod: ## SSH into production instance
	@prod_ip=$$(cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform output -raw instance_public_ip); \
	echo "Connecting to production: $$prod_ip"; \
	ssh -i ~/.ssh/id_communityboard ubuntu@$$prod_ip

health: ## Check application health
	@echo "Backend health: " && curl -s http://localhost:8080/actuator/health | jq .
	@echo "Frontend health: " && curl -s http://localhost:3000 | head -c 100

db-connect: ## Connect to database
	@docker-compose -f docker-compose.staging.yml exec postgres psql -U postgres -d communityboard

db-backup: ## Backup database
	@docker-compose -f docker-compose.staging.yml exec postgres pg_dump -U postgres communityboard > db-backup-$$(date +%s).sql
	@echo "Database backed up"

clean: ## Clean up Docker resources
	@echo "Cleaning up Docker resources..."
	@docker system prune -af
	@docker volume prune -f
	@echo "Cleanup complete"

# ==================== Documentation ====================

docs: ## Show DevOps documentation
	@echo "Available documentation:"
	@ls -1 *.md | grep -E "(DEVOPS|DEPLOYMENT|GITHUB|README|SETUP)"
	@echo ""
	@echo "Read with: cat <filename>"

# ==================== Utility ====================

version: ## Show tool versions
	@echo "Tool Versions:"
	@terraform version | head -1
	@docker --version
	@docker-compose --version
	@aws --version

validate: ## Validate Terraform
	@echo "Validating Terraform..."
	@cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform validate
	@cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform validate
	@echo "Terraform validation passed ✓"

fmt: ## Format Terraform files
	@echo "Formatting Terraform..."
	@cd $(TERRAFORM_DIR) && terraform fmt -recursive
	@echo "Format complete"

security-check: ## Run security checks
	@echo "Running security checks..."
	@echo "Backend: Running dependency check..."
	@cd backend && mvn org.owasp:dependency-check-maven:check
	@echo "Security checks complete"

backup: ## Create infrastructure backup
	@echo "Creating infrastructure backup..."
	@mkdir -p backups
	@cd $(TERRAFORM_DIR)/environments/$(STAGING_ENV) && terraform show > ../../backups/staging-state-$$(date +%s).txt
	@cd $(TERRAFORM_DIR)/environments/$(PROD_ENV) && terraform show > ../../backups/prod-state-$$(date +%s).txt
	@echo "Backup created in backups/ directory"

# ==================== Quick Actions ====================

restart: down up ## Restart containers (staging)

restart-prod: down-prod up-prod ## Restart containers (production)

status: ps health ## Show system status

fresh: clean down ## Fresh start (staging)

fresh-prod: clean down-prod ## Fresh start (production)

.DEFAULT_GOAL := help
