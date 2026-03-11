output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "Primary public subnet ID (AZ-a)"
  value       = aws_subnet.public.id
}

output "public_subnet_ids" {
  description = "All public subnet IDs (AZ-a and AZ-b) — required for ALB"
  value       = [aws_subnet.public.id, aws_subnet.public_b.id]
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.app.id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}
