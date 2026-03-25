# ============================================================
# AWS DEPLOYMENT GUIDE — Maverick Bank
# ============================================================
# Stack: EC2 + RDS MySQL + ECR + CodePipeline (CI/CD)
# ============================================================

# ─── 1. PREREQUISITES ──────────────────────────────────────
# Install AWS CLI, Terraform, Docker
# Configure: aws configure  (Access Key, Secret, Region: ap-south-1)

# ─── 2. PUSH DOCKER IMAGES TO ECR ──────────────────────────
# Create ECR repositories
aws ecr create-repository --repository-name maverick-bank-backend --region ap-south-1
aws ecr create-repository --repository-name maverick-bank-frontend --region ap-south-1

# Authenticate Docker with ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# Build & push backend
docker build -t maverick-bank-backend ./backend
docker tag maverick-bank-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-backend:latest

# Build & push frontend
docker build -t maverick-bank-frontend ./frontend \
  --build-arg REACT_APP_API_URL=https://your-backend-domain.com/api/v1
docker tag maverick-bank-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-frontend:latest

# ─── 3. PROVISION AWS RDS (MySQL) ──────────────────────────
aws rds create-db-instance \
  --db-instance-identifier maverick-bank-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username maverickadmin \
  --master-user-password "MaverickRDS@2024" \
  --db-name maverick_bank \
  --allocated-storage 20 \
  --storage-type gp2 \
  --no-publicly-accessible \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name maverick-subnet-group \
  --backup-retention-period 7 \
  --region ap-south-1

# ─── 4. LAUNCH EC2 (Docker host) ───────────────────────────
# Use t3.small or t3.medium. User-data script:
cat > ec2-userdata.sh << 'USERDATA'
#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && ./aws/install

# Login to ECR and pull images
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

docker pull <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-backend:latest
docker pull <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-frontend:latest
USERDATA

# ─── 5. EC2 DOCKER RUN COMMANDS ────────────────────────────
# Run backend
docker run -d \
  --name maverick-backend \
  -p 8080:8080 \
  -e DB_URL="jdbc:mysql://<RDS_ENDPOINT>:3306/maverick_bank?useSSL=true&serverTimezone=UTC" \
  -e DB_USERNAME="maverickadmin" \
  -e DB_PASSWORD="MaverickRDS@2024" \
  -e JWT_SECRET="YourSuperSecretJWTKeyForMaverickBank2024MustBe64CharactersLong!!" \
  -e CORS_ORIGINS="https://your-frontend-domain.com" \
  -e LOG_PATH="/var/log/maverick-bank" \
  --restart unless-stopped \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-backend:latest

# Run frontend
docker run -d \
  --name maverick-frontend \
  -p 80:80 \
  --restart unless-stopped \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/maverick-bank-frontend:latest

# ─── 6. AWS SECURITY GROUP RULES ──────────────────────────
# EC2 Security Group Inbound Rules:
#   Port 80   - HTTP   - 0.0.0.0/0
#   Port 443  - HTTPS  - 0.0.0.0/0
#   Port 8080 - Custom - Your IP (for direct API access)
#   Port 22   - SSH    - Your IP only
#
# RDS Security Group Inbound Rules:
#   Port 3306 - MySQL  - EC2 Security Group ID only

# ─── 7. AWS CODEPIPELINE CI/CD ─────────────────────────────
# buildspec.yml is generated separately (see infrastructure/aws/)
# Pipeline stages:
#   Source → GitHub (main branch trigger)
#   Build  → CodeBuild (run tests, build Docker images, push to ECR)
#   Deploy → CodeDeploy / SSM Run Command on EC2
