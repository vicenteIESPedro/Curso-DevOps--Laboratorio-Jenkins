# Laboratorio Jenkins: Automatización CI/CD con jenkinsfile #

1. Creación de Tarea en Jenkins y enlace a Repositorio  
Lo primero ha sido crear el token en GitHub que usaré para conectar con Jenkins.  
<img width="1169" height="262" alt="01 - Token Github" src="https://github.com/user-attachments/assets/ae64be54-5712-4fe6-b3d7-4e75ad16d180" />
  
Sobre jenkins he creado una tarea que he llamado Lab-Jenkins. La he definido como Multibranch y la he enlazado al repositorio.
<img width="1167" height="659" alt="02 - Creacion tarea" src="https://github.com/user-attachments/assets/121265c0-9392-4d88-9236-b8072fc76bb0" />  

Una vez lo creo, busca en el repositorio, localizando el fichero Jenkinsfile y poniendo disponible la rama main para realizar ejecuciones.  
<img width="1453" height="376" alt="03 - Rama main" src="https://github.com/user-attachments/assets/1f875ea4-8ece-4fb6-9c43-1b82bba70755" />  

## Parte Obligatoria ##  
1. Opciones de Job
Añado al fichero Jenkinsfile es siguiente código:


  
