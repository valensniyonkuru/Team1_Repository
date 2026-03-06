output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "EC2 instance public IP"
  value       = aws_eip.app.public_ip
}

output "instance_private_ip" {
  description = "EC2 instance private IP"
  value       = aws_instance.app.private_ip
}

output "security_group_id" {
  description = "Security group ID"
  value       = tolist(aws_instance.app.vpc_security_group_ids)[0]
}
