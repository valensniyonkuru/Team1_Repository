output "alb_dns_name" {
  description = "ALB DNS name — access the staging app at http://<alb_dns_name>"
  value       = module.ec2.alb_dns_name
}

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = module.ec2.asg_name
}

output "vpc_id" {
  description = "Staging VPC ID"
  value       = module.network.vpc_id
}

output "security_group_id" {
  description = "Staging security group ID"
  value       = module.network.security_group_id
}
