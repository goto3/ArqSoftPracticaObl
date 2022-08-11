# Api-Gateway

Microservicio que implementa un **proxy reverso** con funcionalidad agregada para interceptar y validar claims de los usuarios (autenticación y autorización).

## Variables de entorno predeterminadas:

```CMD
SET NEWRELIC_API_KEY=KEY
```

Linux:

```bash
export NEWRELIC_API_KEY=KEY
```

# Ambiente de desarrollo : Docker-Compose

`$ docker-compose -f docker-compose.debug.yml up -d --build`

## Requerimientos

-   docker 20.10.8
-   docker-compose 1.29.2

## Comandos

### Build y creación de contenedores

Para ejecutar el sistema ss necesario configurar las variables de entorno mencionadas anteriormente de forma previa en el archivo docker-compose.debug. Luego se debe ejecutar el siguiente comando:

$`docker-compose up -d --build`

### Tear-down de imagenes y contenedores

El siguiente comando borra los recursos generados (imagenes, contenedores, redes, etc)

$`docker-compose down`

### Apagado y encendido de los recursos

Se puede utilizar de forma administrativa. **No impacta los cambios**

$`docker-compose start` y $`docker-compose stop`

### Revisar logs de contenedores

$`docker-compose logs` o tambien $`docker logs [CONTAINER_ID]` para uno individual

## Migraciones de base de datos

Para ejecutar la migración se debe ejecutar el siguiente comando:

$`npm run migrate -- --force=false`

Siendo el argumento force la forma de sincronización, si es true todas las tablas son sincronizadas eliminando su contenido.
