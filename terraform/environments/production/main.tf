terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "communityboard-terraform-state-production"
    key            = "production/terraform.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    dynamodb_table = "communityboard-terraform-locks-production"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CommunityBoard"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

module "network" {
  source = "../../modules/network"

  environment       = "production"
  vpc_cidr          = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  availability_zone = "${var.aws_region}a"
  ssh_allowed_ip    = var.ssh_allowed_ip
}

module "ec2" {
  source = "../../modules/ec2"

  environment      = "production"
  instance_type    = var.instance_type
  root_volume_size = var.root_volume_size
  subnet_id        = module.network.public_subnet_id
  security_group_id = module.network.security_group_id
  public_key       = var.public_key
  log_retention_days = var.log_retention_days
}
