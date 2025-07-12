pipeline {
    agent none

    environment {
        mydockerimage = "deependrabhatta/node_js"
    }

    stages {
        stage('Write Frontend .env in production environment') {
            agent { label 'production' }
            steps {
                writeFile file: './FrontEnd/.env', text: "REACT_APP_API_URL=http://192.168.56.152:5000"
                sh "cat ./FrontEnd/.env"
            }
        }
         stage('Build docker image') {
            agent {label "production"}
            steps {
                echo "Building docker images'"
                sh "docker image build -t ${mydockerimage}:frontend_${BUILD_NUMBER} ./FrontEnd"
                sh "docker image build -t ${mydockerimage}:backend_${BUILD_NUMBER} ./BackEnd"
            }
        }
         stage('Image scanning with trivy') {
            agent {label "production"}
            steps {
                echo "Scanning image vulneriblity"
                sh "trivy image ${mydockerimage}:frontend_${BUILD_NUMBER} > trivy_frontend_report.txt"
                sh "trivy image ${mydockerimage}:backend_${BUILD_NUMBER} > trivy_backend_report.txt"
        }
        }
         stage('Pushing docker image to dockerhub') {
            agent {label "production"}
            steps {
                echo "pushing image to docker hub registry"
                withDockerRegistry ([credentialsId: 'jenkinsdockercred', url: '']) {
                    sh '''
                    docker push ${mydockerimage}:frontend_${BUILD_NUMBER}
                    docker push ${mydockerimage}:backend_${BUILD_NUMBER}
                    '''
                }
            }
        }
        stage('Preparing compose.env file for docker-compose.yaml ') {
            agent {label "deployment"}
            steps {
                script {
            writeFile file: 'compose.env', text: """
FRONTEND_IMAGE=${mydockerimage}:frontend_${BUILD_NUMBER}
BACKEND_IMAGE=${mydockerimage}:backend_${BUILD_NUMBER}
            """
            sh "cat compose.env"
                }
            }
        }
        // stage('Write Frontend .env') {
        //     agent { label 'deployment' }
        //     steps {
        //         writeFile file: './FrontEnd/.env', text: "REACT_APP_API_URL=http://192.168.56.152:5000"
        //         sh "cat ./FrontEnd/.env"
        //     }
        // }
        stage('Clean Workspace') {
            agent { label "deployment" }
            steps {
                sh '''
                    echo "Cleaning workspace, keeping only compose.env and compose.yaml"
                    find . -mindepth 1 -maxdepth 1 \
                        ! -name 'compose.env' \
                        ! -name 'compose.yaml' \
                        -exec rm -rf {} +
                    echo "Remaining files:"
                    ls -la
                '''
            }
        }
        stage('Deploy to devenv ') {
            agent {label "deployment"}
            steps {
                echo 'Running a Development environment'
                sh '''
                docker compose --env-file compose.env down || true
                docker compose --env-file compose.env pull
                docker compose --env-file compose.env up -d
                '''
            }
        }
    }
    post {
        always { 
            node('master'){               
                mail to: 'animeislove1657@gmail.com',
                    subject: "Job '${JOB_NAME}' (${BUILD_NUMBER}) is waiting for input",
                    body: "Please go to ${BUILD_URL} and verify the build"
                cleanWs()
                }
            }    
        success {
                    node('master'){
                    mail bcc: 'dipakbhatt363@gmail.com',
                    to: 'bhattadeependra05@gmail.com',
                    cc: 'bhattad625@gmail.com',
                    from: 'bhattad625@gmail.com',
                    replyTo: '',
                    subject: 'BUILD SUCCESS NOTIFICATION',
                    body: """Hi Team,

                        Build #$BUILD_NUMBER is successful. Please review the build details at:
                        $BUILD_URL

                        Regards,  
                        DevOps Team"""
                    }
                }    
            failure {
                node("master"){
                mail to: 'bhattadeependra05@gmail.com',
                cc: 'dipakbhatt363@gmail.com',
                bcc: '',
                from: 'bhattad625@gmail.com',
                replyTo: 'bhattadeependra05@gmail.com',
                subject: 'BUILD FAILED NOTIFICATION',
                body: """Hi Team,

                    Build #$BUILD_NUMBER is unsuccessful.  
                    Please go through the following URL and verify the details:  
                    $BUILD_URL

                    Regards,  
                    DevOps Team
                    """
                }
            }    
    
    }
}