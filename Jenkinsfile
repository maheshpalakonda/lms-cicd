pipeline {
    agent any

    tools {
        jdk 'java21'
        nodejs 'NodeJS'
        sonar 'SonarScanner'
    }

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        DOCKER_HUB_USER = 'mahesh1925'
        BACKEND_IMAGE = 'mahesh1925/lms-backend'
        FRONTEND_IMAGE = 'mahesh1925/lms-frontend'
    }

    stages {

        // 🧭 Stage 1: Checkout
        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/maheshpalakonda/lms-cicd.git',
                    credentialsId: 'github-pat'
            }
        }

        // 🔍 Stage 2: Code Quality Scan
        stage('Code Quality Scan - SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    echo "🔍 Running SonarQube Analysis..."
                    sonar-scanner \
                        -Dsonar.projectKey=lms-test \
                        -Dsonar.sources=./backend,./frontend \
                        -Dsonar.host.url=http://<SONARQUBE_SERVER_IP>:9000 \
                        -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        // ✅ Stage 3: Quality Gate
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // 🏗️ Stage 4: Build Docker Images
        stage('Build Docker Images') {
            steps {
                sh '''
                echo "🏗️ Building Docker images..."
                docker build -t $BACKEND_IMAGE:latest -f Dockerfile.backend .
                docker build -t $FRONTEND_IMAGE:latest -f Dockerfile.frontend .
                '''
            }
        }

        // 📦 Stage 5: Push to Docker Hub
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo "🔑 Logging into Docker Hub..."
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    echo "📤 Pushing images to Docker Hub..."
                    docker push $BACKEND_IMAGE:latest
                    docker push $FRONTEND_IMAGE:latest

                    echo "🔒 Logout from Docker Hub"
                    docker logout
                    '''
                }
            }
        }

        // 🚀 Stage 6: Deploy Containers
        stage('Deploy Containers') {
            steps {
                sh '''
                echo "🔧 Stopping old containers..."
                docker compose down || true

                echo "🧩 Updating docker-compose.yml to use latest images..."
                sed -i "s|build:.*|image: $BACKEND_IMAGE:latest|g" docker-compose.yml || true
                sed -i "s|build:.*|image: $FRONTEND_IMAGE:latest|g" docker-compose.yml || true

                echo "🚀 Running updated containers..."
                docker compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Build passed and images pushed to Docker Hub!"
            echo "Frontend image: $FRONTEND_IMAGE:latest"
            echo "Backend image:  $BACKEND_IMAGE:latest"
        }
        failure {
            echo "❌ Build failed — check Jenkins logs."
        }
    }
}
