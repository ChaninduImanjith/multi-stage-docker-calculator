# Multi-Stage Docker Calculator

![CI](https://img.shields.io/badge/CI-Passing-brightgreen)
![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A production-ready calculator application built using JavaScript, Jest, ESLint, Multi-Stage Docker, Nginx and GitHub Actions CI/CD.
<img width="628" height="611" alt="image" src="https://github.com/user-attachments/assets/9efd3333-65be-4d01-b38a-8984db0d874f" />



## Features

- Basic Arithmetic Operations
- Scientific Functions
- Calculation History
- Dark/Light Theme
- Keyboard Support
- Responsive UI

## Technologies Used

- JavaScript
- Jest
- ESLint
- Docker
- Nginx
- GitHub Actions

## Run Locally

### Clone Repository

```bash
git clone <your-repository-url>
cd multi-stage-docker-calculator
```

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npm test
```

### Run ESLint

```bash
npx eslint .
```

### Build Docker Image

```bash
docker build -t calculator-app .
```

### Run Container

```bash
docker run -d -p 9090:80 calculator-app
```

## CI/CD Pipeline

GitHub Actions automatically:

- Runs Unit Tests
- Runs ESLint
- Builds Docker Image
- Pushes Docker Image to Docker Hub

## Architecture

```text
Browser
   │
   ▼
Nginx Container
   │
   ▼
JavaScript Calculator Engine
   │
   ▼
Jest Unit Tests
   │
   ▼
GitHub Actions CI/CD
   │
   ▼
Docker Hub
```

## Author

Chanindu Imanjith
