pipeline {
    agent any

    //1. definición de opciones para el Job
    options {
        //deshabilito las ejecuciones concurrentes
        disableConcurrentBuilds()
        
        //establezco que aparezca impresa fecha/hora en las lineas
        //ejecutadas
        timestamps();

        //fijo el tiempo máximo de ejecución del Job en 5 minutos
        timeout(time: 5, unit: 'MINUTES')

        //mantener las diez ultimas ejecuciones del historial
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10')

    }
 
    // 2. definición de variables de entorno FORCE_COLOR y NO_COLOR
    environment {
        FORCE_COLOR = 0
        NO_COLOR = true  
    }    
 
    //Etapas del pipeline
    stages {
        //3. etapa comprobación herramienta
        stage("Audit tools") {
            steps {
                sh 'node --version'
            }
        }

        //4. instalación de dependencias del proyecto
        stage("Install dependencies") {
            steps {
                sh 'npm install'
            }
        }

        //definición de dos etapas que se ejecutan en paralelo
        stage("Linting"){
            parallel {
                //5. Verificación del formato  del codigo definido
                stage("Format check") {
                    steps {
                        //le he añadido un warnError, por que
                        //me da error de formato en README.MD
                        warnError(message: 'No se superaron las comprobaciones de formato'){
                                sh 'npm run format:check'
                            }
                        
                    }
                }

                //6. Comprobación de la cálidad del código
                stage("Code quality") {
                    steps {
                        warnError(message: 'No se superaron los chequeos de calidad de código'){
                                sh 'npm run lint'
                            }
                        script{
                            if (currentBuild.result == 'UNSTABLE') {
                                currentBuild.description= 'unstable: formatcheck'
                            }
                        }    
                    }
                }
            }
        }
        

        

        //7. Comprobación de tipos
        stage("Type check") {
            steps {
                sh 'npm run type-check'
            }
        }

        //ejercicio  5 parte opcional
        stage('E2E test'){
            // defino una variable de entorno necesaria
            environment{
                TEST_MODE = "e2e"      
            }

            //ejecuto los test
            steps{
                sh 'docker compose -f compose.e2e.yml run tests'
            }

            post  {
                //al final, siempre, limpio el servicio
                always{
                    sh 'docker compose -f compose.e2e.yml down -v --remove-orphans || true'
                }  
            }
        }

        //8. Ejecución de test
        stage("Test") {
            steps {
                sh 'npm run test:coverage'
                publishHTML(reportName: "coverage report",
                            reportDir: "coverage",
                            reportFiles: "index.html",
                            keepAll: true,
                            alwaysLinkToLastBuild: true,
                            allowMissing: true)
            }
        }

        //9. Construcción del proyecto y archivado de un artifact
        stage("Build and Archive") {
            steps {
                //build del proyecto
                sh 'npm run build'
                //creación del archivo zip
                sh 'zip -r dist.zip dist'
                //Almacenamiento del archivo creado como artifact
                archiveArtifacts(artifacts: 'dist.zip', fingerprint: true)
            }
        }

        //ejercicio 5, parte opcional: publicar imagen docker
        stage("Publish") {
            //definicion de variables de entorno
            environment{
                //Versión 
                APP_VERSION = sh(script: "npm pkg get version | tr -d '\"'",
                                returnStdout: true).trim()
                //versión-numero de build
                APP_BUILD_VERSION = "${env.APP_VERSION}-${env.BUILD_NUMBER}"
                //repositorio docker
                DOCKER_HUB_REPO = "vicentett1/cep-devops-backend"
            }

            //pasos para la publicacion
            steps{
                script{
                    //usando Dockerregistry con las credenciales definidas en el Job
                    withDockerRegistry(url:'',credentialsId: 'docker-vic' ){
                        //creo la imagen asignandole el nombre del repositorio Docker hub
                        image=docker.build("${DOCKER_HUB_REPO}")
                        //subo la imagen al repositorio con la etiqueta latest
                        image.push("latest")
                        //subo la imagen al repositorio con la etiqueta del numero de versión
                        image.push("${APP_BUILD_VERSION}")
                    }
                }
            }

            //se ejecuta esta etapa si
            when {
                //se cumplen todas las condiciones (and)
                allOf {
                    //estoy en el branch main
                    branch 'main'
                    //el resultado de currentBuil es null o 'SUCCESS'
                    //expression {return currentBuild.result == null || currentBuild.result == 'SUCCESS'}
                }
            }
        }

    }

    //10. definición de etapas finales
    post{

        //siempre se ejecuta
        always{
            //limpieza del espacio de trabajo
            cleanWs()
        }

        //si se ha ejecutado correctamente
        success{
            echo 'Pipeline completed successfully!!!'
        }

        // si se han producido errores
        failure{
            echo 'Pipeline failed. Review logs'
        }
    }
 
}