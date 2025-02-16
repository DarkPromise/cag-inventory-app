# CAG Inventory App

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Application Setup](#application-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application (localhost)](#running-the-application-localhost)
- [Development](#development)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git
- Docker (v24.0 or higher)
- Docker Compose (v2.0 or higher)
- AWS CLI (v2.0 or higher)

## Application Setup

1. Clone the repository:

```bash
git clone https://github.com/darkpromise/cag-inventory-app.git
```

2. Create a .env file in the root directory and add the following:

```
TABLE_NAME="Inventory"
AWS_REGION="localhost"
AWS_DYNAMODB_ENDPOINT="http://localhost:8000"
```

## Installation

### AWS CLI Setup

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

1. Install AWS CLI (Linux)

```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

unzip awscliv2.zip

sudo ./aws/install

aws --version
```

1. Install AWS Cli (Windows)

```
On windows, you may just run the installer found at https://awscli.amazonaws.com/AWSCLIV2.msi

aws --version # To verify the version
```

2. Configure AWS CLI with your credentials:

```bash
aws configure
```

Enter your:

- AWS Access Key ID (fake-accesskey-id)
- AWS Secret Access Key (fake-secret-access-key)
- Default region name
- Default output format

## Backend Setup

Docker is used for setting up the DynamoDB database locally

1. Move into the dynamodb folder

```bash
cd dynamodb
```

2. Build and start the database image

This may take some time while docker pulls the image from the internet

```bash
docker compose up -d --wait
```

Ensure that the DynamoDB docker image is running. Once it is up and running, you may move on to the following steps

3. Navigate to the scripts directory

```bash
cd dynamodb/scripts
```

4. Setup the tables

```bash
./setup-db
```

5. To stop the DynamoDB service

```bash
docker compose down
```

## Frontend Setup

1. On the root directory, install the dependencies

```bash
npm install
```

## Running the Application (localhost)

Ensure that the database is running

1. Start the DynamoDB service:

```bash
cd dynamodb
```

2. To run in detached mode:

```bash
docker compose up -d --wait
```

3. Start the application:

```bash
npm run dev # For development
```

or

```bash
npm run build # For production
npm run start # For production
```

The application will be available at http://localhost:3000

4. To stop all services:

```bash
docker compose down
```

## Development

### Code Style

- The project uses ESLint and Prettier for code formatting
- Run linting: `npm run lint`

### Testing

- Testing is done using jest

- Run tests: `npm run test`

## Troubleshooting

### Common Issues

1. **Docker Issues**

   - Verify Docker daemon is running
   - Check container logs: `docker compose logs`
   - Ensure ports aren't conflicting
   - Clear Docker cache if needed: `docker system prune`

2. **AWS CLI Issues**

   - Verify credentials in `~/.aws/credentials`
   - Check region configuration
   - Test connection: `aws sts get-caller-identity`

3. **Database Connection Errors**

   - Verify the DynamoDB database is running on port 8000
   - Ensure database exists and the table **Inventory** exists

4. **Port Conflicts**

   - Check if ports 3000 or 8000 are already in use
