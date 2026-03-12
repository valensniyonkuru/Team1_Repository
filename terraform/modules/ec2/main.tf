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

# Key Pair
resource "aws_key_pair" "deployer" {
  key_name   = "${var.environment}-deployer-key"
  public_key = var.public_key

  tags = {
    Name        = "${var.environment}-deployer-key"
    Environment = var.environment
  }
}

# IAM Role — allows EC2 instances to use SSM (no SSH needed for deploys)
resource "aws_iam_role" "ec2_ssm" {
  name = "${var.environment}-ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = {
    Name        = "${var.environment}-ec2-ssm-role"
    Environment = var.environment
  }
}

# Attach AWS managed policy for SSM core functionality
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch agent policy for log shipping
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.ec2_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Instance profile wraps the IAM role so EC2 can use it
resource "aws_iam_instance_profile" "ec2_ssm" {
  name = "${var.environment}-ec2-ssm-profile"
  role = aws_iam_role.ec2_ssm.name

  tags = {
    Name        = "${var.environment}-ec2-ssm-profile"
    Environment = var.environment
  }
}

# Launch Template — used by the Auto Scaling Group
resource "aws_launch_template" "app" {
  name_prefix            = "${var.environment}-app-lt-"
  image_id               = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deployer.key_name
  iam_instance_profile {
    arn = aws_iam_instance_profile.ec2_ssm.arn
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    ENVIRONMENT = var.environment
  }))

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.security_group_id]
  }

  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_type           = "gp3"
      volume_size           = var.root_volume_size
      delete_on_termination = true
      encrypted             = true
    }
  }

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-app-instance"
      Environment = var.environment
    }
  }

  tag_specifications {
    resource_type = "volume"
    tags = {
      Name        = "${var.environment}-root-volume"
      Environment = var.environment
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Application Load Balancer
resource "aws_lb" "app" {
  name               = "${var.environment}-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.subnet_ids

  tags = {
    Name        = "${var.environment}-alb"
    Environment = var.environment
  }
}

# ALB Target Group — frontend (port 3000)
resource "aws_lb_target_group" "frontend" {
  name     = "${var.environment}-frontend-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name        = "${var.environment}-frontend-tg"
    Environment = var.environment
  }
}

# ALB Target Group — backend (port 8080)
resource "aws_lb_target_group" "backend" {
  name     = "${var.environment}-backend-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/actuator/health"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name        = "${var.environment}-backend-tg"
    Environment = var.environment
  }
}

# ALB Listener — HTTP:80 → forward to frontend
resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ALB Listener — HTTP:8080 → forward to backend
resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.app.arn
  port              = 8080
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "app" {
  name                = "${var.environment}-app-asg"
  desired_capacity    = var.asg_desired
  min_size            = var.asg_min
  max_size            = var.asg_max
  vpc_zone_identifier = var.subnet_ids

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  target_group_arns = [
    aws_lb_target_group.frontend.arn,
    aws_lb_target_group.backend.arn,
  ]

  health_check_type         = "ELB"
  health_check_grace_period = 120

  tag {
    key                 = "Name"
    value               = "${var.environment}-app-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Scale-Out Policy — add instance when CPU > 70% for 2 mins
resource "aws_autoscaling_policy" "scale_out" {
  name                   = "${var.environment}-scale-out"
  autoscaling_group_name = aws_autoscaling_group.app.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = 1
  cooldown               = 300
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.environment}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Scale out when CPU > 70% for 2 minutes"
  alarm_actions       = [aws_autoscaling_policy.scale_out.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }
}

# Scale-In Policy — remove instance when CPU < 30% for 10 mins
resource "aws_autoscaling_policy" "scale_in" {
  name                   = "${var.environment}-scale-in"
  autoscaling_group_name = aws_autoscaling_group.app.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = -1
  cooldown               = 300
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "${var.environment}-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 10
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 30
  alarm_description   = "Scale in when CPU < 30% for 10 minutes"
  alarm_actions       = [aws_autoscaling_policy.scale_in.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
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
