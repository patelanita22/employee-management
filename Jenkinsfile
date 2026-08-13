pipeline {
    agent any 

stages{

    stage ('checkout') {

steps {

    checkout scm
}

stage ('Docker Build') {
 sh 'docker-compose build'

}
 stage ('Docker Deploy') {
    steps {
        sh 'docker-compose up -d'
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
















}