# Data source for Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance
resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  key_name               = aws_key_pair.deployer.key_name

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    ENVIRONMENT = var.environment
  }))

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name        = "${var.environment}-root-volume"
      Environment = var.environment
    }
  }

  monitoring    = true
  ebs_optimized = true

  tags = {
    Name        = "${var.environment}-app-instance"
    Environment = var.environment
  }

  depends_on = [aws_key_pair.deployer]
}

# Elastic IP for static public IP
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name        = "${var.environment}-eip"
    Environment = var.environment
  }

  depends_on = [aws_instance.app]
}

# Key Pair (use existing key or create new one)
resource "aws_key_pair" "deployer" {
  key_name   = "${var.environment}-deployer-key"
  public_key = var.public_key

  tags = {
    Name        = "${var.environment}-deployer-key"
    Environment = var.environment
  }
}

# CloudWatch Log Group for monitoring
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ec2/${var.environment}/app"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.environment}-app-logs"
    Environment = var.environment
  }
}
