## Variables de entorno

- CLEARDB = Limpia la base de datos
- DBHOST = hostname del servidor postgres
- DBPORT = puerto del servidor postgres
- DBNAME = nombre de la base de datos del servidor postgres
- DBUSER = usuario de la base de datos postgres
- DBPASSWORD = constraseña de la base de datos postgres
- AMQPHOSTNAME = hostname del servidor AMQP
- AMQPPORT = puerto del servidor AMQP
- AMQPUSERNAME = nombre de usuario del servidor AMQP
- AMQPPASSWORD = constraseña del servidor AMQP
- AMQPBOOKSQUEUE = nombre de la cola de los libros
- AMQPRESERVATIONSQUEUE = nombre de la cola de las reservas
- AMQPPREFETCHCOUNT = cantidad de mensajes que procesa concurrentemente este worker

Valores predeterminados:

Windows:

```CMD
SET CLEARDB=false
SET DBHOST=postgres-queries
SET DBPORT=5432
SET DBNAME=asp-queries
SET DBUSER=postgres
SET DBPASSWORD=admin       
SET AMQPHOSTNAME=rabbitmq-queries
SET AMQPPORT=5672
SET AMQPUSERNAME=rabbitmq
SET AMQPPASSWORD=admin
SET AMQPBOOKSQUEUE=books_queue
SET AMQPRESERVATIONSQUEUE=reservations_queue
SET AMQPPREFETCHCOUNT=20
```

Linux:

```bash
export CLEARDB=false
export DBHOST=postgres-queries
export DBPORT=5432
export DBNAME=asp-queries
export DBUSER=postgres
export DBPASSWORD=admin       
export AMQPHOSTNAME=rabbitmq-queries
export AMQPPORT=5672
export AMQPUSERNAME=rabbitmq
export AMQPPASSWORD=admin
export AMQPBOOKSQUEUE=books_queue
export AMQPRESERVATIONSQUEUE=reservations_queue
export AMQPPREFETCHCOUNT=20
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
