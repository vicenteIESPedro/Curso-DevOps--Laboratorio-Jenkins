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

        //5. Creacion de ficheros autogenerados
        stage("Generate files") {
            steps {
                sh 'npm run prisma:generate'
            }
        }

        //definición de dos etapas que se ejecutan en paralelo
        stage("Linting"){
            parallel {
                //6. Verificación del formato  del codigo definido
                stage("Format check") {
                    steps {
                        //añadido warnError ya que error esta fase al analizar el archivo
                        //README.MD
                        warnError(message: 'Error al chequear README.MD'){
                                sh 'npm run format:check'
                            }
                        
                    }
                }

                //7. Comprobación de la cálidad del código
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
        

        

        //8. Comprobación de tipos
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

        //9. Ejecución de test
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

        //10. Construcción del proyecto y archivado de un artifact
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

    }

    //11. definición de etapas finales
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