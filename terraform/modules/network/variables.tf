variable "environment" {
  description = "Environment name (staging or production)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet AZ-a"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_cidr_b" {
  description = "CIDR block for public subnet AZ-b (required for ALB)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "availability_zone" {
  description = "Availability zone for subnet AZ-a"
  type        = string
}

variable "availability_zone_b" {
  description = "Availability zone for subnet AZ-b (required for ALB)"
  type        = string
}

variable "ssh_allowed_ip" {
  description = "IP address allowed for SSH access (CIDR format)"
  type        = string
  sensitive   = true
}
