
pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
                echo 'Source code checked out successfully.'
            }
        }

        stage('Verify Project Files') {
            steps {
                sh 'test -f docker-compose.yml'
                sh 'test -f backend/Dockerfile'
                sh 'test -f frontend/Dockerfile'

                echo 'All required Docker files are present.'
            }
        }
    }
}
