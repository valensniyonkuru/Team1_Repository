terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "communityboard-terraform-state-staging"
    key            = "staging/terraform.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    dynamodb_table = "communityboard-terraform-locks-staging"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CommunityBoard"
      Environment = "staging"
      ManagedBy   = "Terraform"
    }
  }
}

module "network" {
  source = "../../modules/network"

  environment          = "staging"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidr   = var.public_subnet_cidr
  public_subnet_cidr_b = var.public_subnet_cidr_b
  availability_zone    = "${var.aws_region}a"
  availability_zone_b  = "${var.aws_region}b"
  ssh_allowed_ip       = var.ssh_allowed_ip
}

module "ec2" {
  source = "../../modules/ec2"

  environment        = "staging"
  instance_type      = var.instance_type
  root_volume_size   = var.root_volume_size
  vpc_id             = module.network.vpc_id
  subnet_ids         = module.network.public_subnet_ids
  security_group_id  = module.network.security_group_id
  public_key         = var.public_key
  log_retention_days = var.log_retention_days
  asg_desired        = var.asg_desired
  asg_min            = var.asg_min
  asg_max            = var.asg_max
}
