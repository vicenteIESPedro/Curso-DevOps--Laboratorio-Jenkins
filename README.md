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
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
```
 

  






  





