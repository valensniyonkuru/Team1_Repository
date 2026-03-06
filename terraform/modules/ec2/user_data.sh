#!/bin/bash
set -e

# Update system packages
apt-get update
apt-get upgrade -y

# Install Docker
apt-get install -y curl gnupg lsb-release ubuntu-keyring

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update

# Install Docker and Docker Compose
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable Docker service
systemctl enable docker
systemctl start docker

# Install Docker Compose standalone (for backwards compatibility)
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app user
useradd -m -s /bin/bash -u 1000 appuser || true

# Create app directory
mkdir -p /opt/app
chown appuser:appuser /opt/app

# Add appuser to docker group
usermod -aG docker appuser || true

# Create environment file (will be filled by CI/CD)
touch /opt/app/.env
chown appuser:appuser /opt/app/.env
chmod 600 /opt/app/.env

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb

# Install additional tools
apt-get install -y git wget curl vim htop

# Set up log rotation
mkdir -p /var/log/communityboard
chown appuser:appuser /var/log/communityboard

# Create systemd service for application management
cat > /etc/systemd/system/communityboard.service <<EOF
[Unit]
Description=Community Board Application
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/app
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

echo "Environment setup complete for ${ENVIRONMENT}"
