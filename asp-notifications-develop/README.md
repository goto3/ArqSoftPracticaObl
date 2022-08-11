# Propósito y alcance del proyecto

# Environment

Variables de entorno necesarias:

Windows:

```CMD
SET PUBLIC_KEY=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQ==
SET PORT=4300
SET DB_CONNECTION=postgres://postgres:admin@localhost:5436/asp-notifications
SET AMQP_CONNECTION=amqp://rabbitmq:admin@rabbitmq-books:5672
SET AMQP_NOTIFICATIONS_QUEUE_NAME=email_queue
SET AMQP_RESERVATIONS_QUEUE_NAME=reservations_q_notifications
SET AMQP_RESERVATIONS_EXCHANGE_NAME=asp-reservations
SET AMQP_PREFETCHCOUNT=100
SET WORKERTIMEOUT=60000
SET NEWRELIC_API_KEY=KEY
```

Linux:

```bash
export PUBLIC_KEY=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQ==
export PORT=4300
export DB_CONNECTION=postgres://postgres:admin@localhost:5436/asp-notifications
export AMQP_CONNECTION=amqp://rabbitmq:admin@rabbitmq-books:5672
export AMQP_NOTIFICATIONS_QUEUE_NAME=email_queue
export AMQP_RESERVATIONS_QUEUE_NAME=reservations_q_notifications
export AMQP_RESERVATIONS_EXCHANGE_NAME=asp-reservations
export AMQP_PREFETCHCOUNT=100
export WORKERTIMEOUT=60000
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
