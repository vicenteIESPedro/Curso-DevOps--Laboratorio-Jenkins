pipeline {
    agent any

    //definición de opciones para el Job
    options {
        //deshabilito las ejecuciones concurrentes
        disableConcurrentBuilds()
        
        //establezco que aparezca impresa fecha/hora en las lineas
        //ejecutadas
        timestamps();

        //fijo el tiempo máximo de ejecución del Job en 5 minutos
        timeout(time: 5, unit: 'MINUTES')

    }
 

    stages {
        stage("prueba") {
            steps {
                echo "funciona"
            }
        }
    }
 
}