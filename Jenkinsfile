pipeline {
    agent any

    environment {
        mydockerimage = "deependrabhatta/node_js"
    }

    stages {
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
                    docker push $${mydockerimage}:backend_${BUILD_NUMBER}
                    '''
                }
            }
        }
    //     stage('Deploy to devenv ') {
    //         agent {label "deployment"}
    //         steps {
    //             echo 'Running a Development environment'
    //             sh '''
    //             docker container stop myapp || true
    //             docker container rm myapp || true
    //             docker image rm ${mydockerimage}:${BUILD_NUMBER} || true
    //             docker run -d --name myapp -p 8089:8080 ${mydockerimage}:${BUILD_NUMBER}
    //             '''
    //         }
    //     }
    //     stage('Deploy Production Environment') {
    //         agent {label "deployment"}
    //         steps {
    //             timeout(time:5, unit:'minutes'){
    //             input message:'Approve PRODUCTION Deployment?'
    //             }
    //             echo "Running app on Prod env"
    //             sh '''
    //             docker stop mymanualdeployapp || true
    //             docker rm mymanualdeployapp || true
    //             docker image rm ${mydockerimage}:${BUILD_NUMBER} || true
    //             docker run -itd --name mymanualdeployapp -p 8083:8080 $mydockerimage:$BUILD_NUMBER
    //             '''
    //         }
    //     }
    // }
    // post {
    //      always { 
    //         mail to: 'animeislove1657@gmail.com',
    //         subject: "Job '${JOB_NAME}' (${BUILD_NUMBER}) is waiting for input",
    //         body: "Please go to ${BUILD_URL} and verify the build"
    //         cleanWs()
    //     }
    //     success {
    //         mail bcc: 'dipakbhatt363@gmail.com', 
    //         body: """Hi Team,
    //         Build #$BUILD_NUMBER is successful, please go through the url
    //         $BUILD_URL
    //         and verify the details.
    //         Regards,
    //         DevOps Team""",
    //         cc: 'bhattad625@gmail.com', 
    //         from: 'bhattad625@gmail.com', 
    //         replyTo: '', 
    //         subject: 'BUILD SUCCESS NOTIFICATION', 
    //         to: 'bhattadeependra05@gmail.com'
    //     }
    //     failure {
    //         mail bcc: '', 
    //         body: """Hi Team,
    //         Build #$BUILD_NUMBER is unsuccessful, please go through the url
    //         $BUILD_URL
    //         and verify the details.
    //         Regards,
    //         DevOps Team""", 
    //         cc: 'dipakbhatt363@gmail.com', 
    //         from: 'bhattad625@gmail.com', 
    //         replyTo: 'bhattadeependra05@gmail.com', 
    //         subject: 'BUILD FAILED NOTIFICATION', 
    //         to: 'bhattadeependra05@gmail.com'
        // }
    }
}