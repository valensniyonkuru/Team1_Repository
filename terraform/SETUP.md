# Backend Configuration Setup Guide

## Initial Setup (Local State)

The terraform configurations are initially configured to use local state. To initialize:

```bash
cd terraform/environments/staging
terraform init

cd ../production
terraform init
```

## Production Setup (Remote Backend with S3 + DynamoDB)

For a production-grade setup with state locking:

### 1. Create S3 Buckets (run once)

```bash
aws s3api create-bucket \
  --bucket communityboard-terraform-state-staging \
  --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1

aws s3api put-bucket-versioning \
  --bucket communityboard-terraform-state-staging \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket communityboard-terraform-state-staging \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Repeat for production bucket
aws s3api create-bucket \
  --bucket communityboard-terraform-state-production \
  --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1
```

### 2. Create DynamoDB Tables (run once)

```bash
aws dynamodb create-table \
  --table-name communityboard-terraform-locks-staging \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-north-1

aws dynamodb create-table \
  --table-name communityboard-terraform-locks-production \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-north-1
```

### 3. Enable Backend in Terraform

Uncomment the `backend "s3"` block in:
- `terraform/environments/staging/main.tf`
- `terraform/environments/production/main.tf`

Then reinitialize:

```bash
cd terraform/environments/staging
terraform init -migrate-state
```

## Deploying Infrastructure

### Staging

```bash
cd terraform/environments/staging
terraform plan -var-file="staging.tfvars"
terraform apply -var-file="staging.tfvars"
```

### Production

```bash
cd terraform/environments/production
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"
```

## Important Notes

- Always use `terraform plan` before `apply`
- Terraform state file contains sensitive information - never commit to git
- Use `.gitignore` to exclude: `*.tfstate*`, `.terraform/`, `*.tfvars` (except examples)
- Keep `*-example.tfvars` files in git for documentation
