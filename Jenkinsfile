pipeline {

    agent any

    environment {
        DOCKERHUB_USER = 'anitaraut'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build') {
    steps {
        sh 'docker build  -t employee-management_backend:latest ./backend'
        sh 'docker build --no-cache -t employee-management_frontend:latest ./frontend'
    }
}

        stage('Docker Hub Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'DockerHub-Cred',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login \
                        -u "$DOCKER_USER" \
                        --password-stdin
                    '''
                }
            }
        }
       
        stage('Tag Images') {
            steps {
                sh '''
                    docker tag employee-management_backend:latest \
                    $DOCKERHUB_USER/employee-management-backend:latest

                    docker tag employee-management_frontend:latest \
                    $DOCKERHUB_USER/employee-management-frontend:latest
                '''
            }
        }

       stage('Push Images to Docker Hub') {
    steps {
        sh '''
            docker push $DOCKERHUB_USER/employee-management-backend:latest

            docker push $DOCKERHUB_USER/employee-management-frontend:latest
        '''
    }
}

        stage('Deploy') {
            steps {
              
              sh 'docker-compose down'       
              sh 'docker-compose up -d --build'
            }
        }

        stage('Verify') {
            steps {
                sh 'docker-compose ps'
            }
        }
    }

    post {

        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD Pipeline failed!'
        }
    }
}