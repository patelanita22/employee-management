pipeline {

    agent any

    environment {
        DOCKERHUB_USER = 'anitaraut'
        IMAGE_TAG = "${BUILD_NUMBER}"

        BACKEND_IMAGE = 'employee-backend-management'
        FRONTEND_IMAGE = 'employee-frontend-management'

        BACKEND_CONTAINER = 'employee-backend'
        FRONTEND_CONTAINER = 'employee-frontend'

        DOCKER_NETWORK = 'employee-network'
        
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

 stage('Clean Old Deployment') {
    steps {
        sh """
            echo "Stopping old containers..."

            docker stop ${BACKEND_CONTAINER} || true
            docker stop ${FRONTEND_CONTAINER} || true
            
            echo "Removing old containers..."

            docker rm -f ${BACKEND_CONTAINER} || true
            docker rm -f ${FRONTEND_CONTAINER} || true

             echo "Cleaning stopped containers..."

            docker container prune -f || true

             echo "Cleaning unused images..."

            docker image prune -f || true
        """
    }
}
       
        stage('Docker Build') {
    steps {
        sh "docker build  -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend"
 
        sh "docker build  -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend"
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
                sh """
                    docker tag \
                    ${BACKEND_IMAGE}:${IMAGE_TAG} \
                    $DOCKERHUB_USER/${BACKEND_IMAGE}:${IMAGE_TAG}

                    docker tag \
                    ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                    $DOCKERHUB_USER/${FRONTEND_IMAGE}:${IMAGE_TAG}

                    """
                 }
        }

       stage('Push Images to Docker Hub') {
    steps {
        sh """
            docker push \
            $DOCKERHUB_USER/${BACKEND_IMAGE}:${IMAGE_TAG}

            docker push \
            $DOCKERHUB_USER/${FRONTEND_IMAGE}:${IMAGE_TAG}
        """
    }
}

 stage('Pull Images') {
            steps {
                sh """
                    echo "===== Pulling Backend Image ====="

                    docker pull \
                    ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}

                    echo "===== Pulling Frontend Image ====="

                    docker pull \
                    ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }
        
        

        stage('Deploy Frontend') {
            steps {
                sh """
                    echo "===== Starting Frontend Container ====="

                    docker run -d \
                    --name ${FRONTEND_CONTAINER} \
                    --network ${DOCKER_NETWORK} \
                    -p 5173:5173 \
                    ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy backend') {
            steps {
                sh """
                    echo "===== Starting backend Container ====="

                    docker run -d \
                    --name ${BACKEND_CONTAINER} \
                    --network ${DOCKER_NETWORK} \
                    -p 8081:8080 \
                    ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }


stage('Verify') {
    steps {
        sh """
            echo "===== Docker Images ====="
            docker images

            echo "===== Running Containers ====="
            docker ps
        """
    }
}

    }

post {
        always {
            sh 'docker logout'
        }


        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

       failure {
            echo 'CI/CD Pipeline failed!'
        }
    }

}