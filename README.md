# Laboratorio Jenkins: Automatización CI/CD con jenkinsfile #

El primer paso es definir una tarea en Jenkins y enlazar la misma a nuestro proyecto de GITHUB.  
Empezamos por crear el token en GitHub que usaré para conectar con Jenkins.  
<img width="1169" height="262" alt="01 - Token Github" src="https://github.com/user-attachments/assets/ae64be54-5712-4fe6-b3d7-4e75ad16d180" />
  
Sobre jenkins creo una tarea que llamo Lab-Jenkins. La he definido como Multibranch y la he enlazado al repositorio.
<img width="1167" height="659" alt="02 - Creacion tarea" src="https://github.com/user-attachments/assets/121265c0-9392-4d88-9236-b8072fc76bb0" />  

Una vez lo creo, busca en el repositorio, localizando el fichero Jenkinsfile y poniendolo disponible en las ramas main y dev-jenkins.  
La rama dev-jenkins será sobre la que ejecutaré los trabajos.   
<img width="1333" height="423" alt="03 - Rama main" src="https://github.com/user-attachments/assets/1751a909-f81c-4ff1-8877-6df834209c1b" />   

    
## Parte Obligatoria ##  
1. Definición del archivo Jenkinsfile con las directivas, variables de entorno y etapas  
  
```
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

        //instalación de dependencias del proyecto
        stage("Install dependencies") {
            steps {
                sh 'npm install'
            }
        }

        //5. Verificación del formato  del codigo definido
        stage("Format check") {
            steps {
                sh 'npm run format:check'
            }
        }

        //6. Comprobación de la cálidad del código
        stage("Code quality") {
            steps {
                sh 'npm run lint'
            }
        }

        //7. Comprobación de tipos
        stage("Type check") {
            steps {
                sh 'npm run type-check'
            }
        }

        //8. Ejecución de test
        stage("Test") {
            steps {
                sh 'npm run test'
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
```
Lo he subido al repositorio de github.  
  
2. Ejecución del Pipeline  
Seleccionamos la rama dev-jenkins. Una vez en la página correspondiente a la rama, pulsamos en contruir ahora/build now
<img width="630" height="380" alt="04 -Pagina rama" src="https://github.com/user-attachments/assets/0d0d4630-4a86-4417-b6e2-84170eeaa859" />

Comienza la ejecución de una nueva build, sobre la que pulsamos apareciendonos la página correspondiente a la build.  
<img width="929" height="552" alt="050 - Pagina build" src="https://github.com/user-attachments/assets/5a280ab4-1029-4fc2-bb8a-5f5c6b80d680" />  

Podemos ver como va la ejecución de las diferentes etapas pulsando en Pipeline Overview.  
<img width="1317" height="683" alt="05 - Ejecucion job" src="https://github.com/user-attachments/assets/1db95d11-f0b0-4c93-a6dd-4fae57325dd2" />  
  
Como podemos ver, ya ha finalizado la ejecución, con todos los pasos correctos.  
Sólo nos queda comprobar que el artifact se ha creado. Para ello, volvemos a la página de la rama. Puede tambien comprobarse en la build.  
<img width="661" height="495" alt="06 - Artifact" src="https://github.com/user-attachments/assets/43762444-a902-40d2-ae2d-ebc2abaf1a41" />  

## PARTE VOLUNTARIA ##  
  
1. Ejecución de test con cobertura.  
El primer paso es instalar el plugin HTML Publisher Plugin.  
Nos vamos a configurar/Pluggins y seleccionamos available plugins. Lo buscamos y pulsamos el botón install.  
<img width="1322" height="268" alt="07 - Instalar plugin" src="https://github.com/user-attachments/assets/882244ce-495f-4b86-a10f-21d22665aa2a" />
Tras la instalación reiniciamos Jenkins.  
  
Podemos comprobar cual es la sintaxis de este pluggin mediante la ayuda que encontraremos en  Jenkins/trabajo/pipeline syntax/steps reference.  
<img width="792" height="317" alt="08 - ayuda" src="https://github.com/user-attachments/assets/12a7f859-0da2-4cb8-a0c8-444232660f33" />  
Y buscando publishHTML.  
<img width="649" height="508" alt="09 - ayuda publishHTML" src="https://github.com/user-attachments/assets/8f792b27-646b-45a0-8d02-c70f582fc75c" />  

Una vez tenemos la información modificamos la etapa Test del jenkisfile, por el siguiente código:  
```
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
```
Podemos ejecutarlo  
<img width="1304" height="661" alt="10 - ejecutar test" src="https://github.com/user-attachments/assets/a2733611-61d9-402a-be64-94e18b936514" />  

Como resultado, en la página de la rama nos aparece una nueva linea (coverage report) correspondiente a la operación de publicar que hemos realizado en la etapa test.  
<img width="591" height="292" alt="11 - menu" src="https://github.com/user-attachments/assets/30a45c1d-de6d-422f-875f-cc6b73d75daa" />  

Al pulsar sobre ella, podemos ver el informe:  
<img width="1257" height="373" alt="12 - html" src="https://github.com/user-attachments/assets/e46a2b66-7cb5-42df-9297-ae25db257cc0" />  
  
Nota, para generar la sintaxis del comando publishHTML podemos usar un asistente que incorpora Jenkins en Trabajo/Pipeline sintax, pulsando posteriormente en Snipped Generator.  
<img width="1380" height="563" alt="14 -Generador de funciones" src="https://github.com/user-attachments/assets/5f0652f2-c3dc-41c7-8f66-86ac35f19ce2" />  
  
  
2. Opciones extra del Job.  
Nos piden mantener en el historial las últimas 10 ejecuciones. Esto se realiza mediante la opción buildDiscarder.  
Modificamos el fichero jenkinsfile añadiendo esta opción.
```
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
```

Nota: podemos usar el generador de directivas para obtener esta opción con su sintaxis correcta.  
Opción trabajo/pipeline sintaxis, declarative directive generator.   
<img width="1464" height="601" alt="13 -Generador de directivas" src="https://github.com/user-attachments/assets/8b8cafd0-8d54-4ea5-8a03-e2c56b4de7e2" />  

3. Linting en paralelo
Las etapas se pueden ejecutar en paralelo. En este caso se van a ejecutar las etapas Format Check y Code Quality. Para ello se usa parallel{}
El código sería:
```
        //definición de dos etapas que se ejecutan en paralelo
        stage("Liting"){
            parallel {
                //5. Verificación del formato  del codigo definido
                stage("Format check") {
                    steps {
                        sh 'npm run format:check'
                    }
                }

                //6. Comprobación de la cálidad del código
                stage("Code quality") {
                    steps {
                        sh 'npm run lint'
                    }
                }
            }
        }
```

Podemos observar como la ejecución se realiza en paralelo.  
<img width="1261" height="688" alt="15 -ejecucion paralela" src="https://github.com/user-attachments/assets/77de60c4-1690-4000-9c97-677483baa9cb" />  

4. Code quality permisivo.
Si falla un paso, los siguientes no se ejecutan.
Para evitar ésto se usa warnError.
Para probarlo introduzco un cambio en el fichero server.ts y modifico el archivo jenkinsfile con el siguiente código:
```
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
```
Si lo ejecutamos podemos ver como se genera el warning y continua la ejecución.  
<img width="866" height="744" alt="16 -warning" src="https://github.com/user-attachments/assets/5c062d0a-b128-4cf2-ab28-be9bfa4eb2a4" />  

5. Pruebas E2E con docker compose  
Podemos incluir dentro de un stage un apartado post para realizar operaciones al final.  
Por ejemplo, puede usarse para limpiar servicios.  
Con este codigo, realizamos unos test E2E y ejecutamos una limpieza de los servicios levantados.  
```
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

```
Al ejecutarla, podemos observar como se levanta el servicio y se baja al final  
<img width="1320" height="543" alt="18 -e2e" src="https://github.com/user-attachments/assets/c1d1a31a-44c4-462c-99c3-4cf74c14ae28" />  
  
6. Cosntrucción y publicación de imagen Docker  
Para publicar una imagen en docker es necesario varios pasos previos:
* Tener instalado el pluggin Docker Pipeline
* Tener registradas las credenciales de DockerHub en el Proyecto.  
Para ello ir a Proyecto/ Credentials. Yo he definido una credencial de tipo usuario/contraseña a la que he puesto como id docker-vic.  
<img width="931" height="276" alt="19 -credenciales" src="https://github.com/user-attachments/assets/ec4ba384-eef7-4360-861f-36af4ab6fe45" />  
* Crear en DockerHub el repositorio destino de las imagenes.  
<img width="628" height="196" alt="20 -dockerhub" src="https://github.com/user-attachments/assets/9b86a034-58c1-4883-bab0-4972c551096f" />  
  
Una vez tengo todos los requisitos, creo mi etapa en el Jenkinsfile:  
```
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
```
  
Lo subo al repositorio y lanzo una ejecución en la rama main  
<img width="1484" height="664" alt="21 -ejecucion publish" src="https://github.com/user-attachments/assets/9c3ae0cf-bc4a-47b1-b852-2f6caba941b4" />  
  
Como se ve, se ha ejecutado con exito la etapa Publish, pudiendo comprobar en DockerHub que apararecen las imágenes:  
<img width="814" height="566" alt="22 -dockerhub imagenes" src="https://github.com/user-attachments/assets/05e91733-deaf-4997-bc72-bb798b5dfc7b" />








