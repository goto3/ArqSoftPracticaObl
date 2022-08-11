## Variables de entorno

Windows:

```CMD
SET FRONTENDHOST=asp2021.software
SET EMAILDOMAIN=asp2021.software
SET MAILGUN_API_KEY=KEY
SET AMQPCONNECTION=amqp://rabbitmq:admin@rabbitmq-tenancy:5672
SET AMQPEMAILQUEUENAME=email_queue
SET AMQPPREFETCHCOUNT=100
SET NEWRELIC_API_KEY=KEY
```

Linux:

```bash
export FRONTENDHOST=asp2021.software
export EMAILDOMAIN=asp2021.software
export MAILGUN_API_KEY=KEY
export AMQPCONNECTION=amqp://rabbitmq:admin@rabbitmq-tenancy:5672
export AMQPEMAILQUEUENAME=email_queue
export AMQPPREFETCHCOUNT=100
export NEWRELIC_API_KEY=KEY
```
# Ambiente de desarrollo : Docker-Compose

Para el entorno de desarrollo se generó un docker-compose el cual permite levantar los recursos necesarios de forma conjunta. A continuación se listan una serie de comandos para manejar el docker-compose.

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
