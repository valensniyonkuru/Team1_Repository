# Production Environment Terraform Variables
# Usage: terraform apply -var-file="production.tfvars"

aws_region     = "eu-north-1"
instance_type  = "t3.small"
root_volume_size = 50

ssh_allowed_ip         = "0.0.0.0/0"
public_key             = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAID/4qtnh1QbJd/tI4RVNsOhtMwlJnZJBgVci8jn+Ix0j devops@communityboard"  # Get from below
