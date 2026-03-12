output "alb_dns_name" {
  description = "ALB DNS name — use this to access the application"
  value       = aws_lb.app.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.app.arn
}

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = aws_autoscaling_group.app.name
}

output "frontend_target_group_arn" {
  description = "Frontend ALB target group ARN"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  description = "Backend ALB target group ARN"
  value       = aws_lb_target_group.backend.arn
}

output "security_group_id" {
  description = "Security group ID"
  value       = var.security_group_id
}

output "iam_instance_profile_arn" {
  description = "IAM instance profile ARN (used by SSM)"
  value       = aws_iam_instance_profile.ec2_ssm.arn
}
