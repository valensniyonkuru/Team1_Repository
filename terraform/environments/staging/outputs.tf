output "instance_public_ip" {
  description = "Staging EC2 instance public IP"
  value       = module.ec2.instance_public_ip
}

output "instance_id" {
  description = "Staging EC2 instance ID"
  value       = module.ec2.instance_id
}

output "vpc_id" {
  description = "Staging VPC ID"
  value       = module.network.vpc_id
}

output "security_group_id" {
  description = "Staging security group ID"
  value       = module.network.security_group_id
}
