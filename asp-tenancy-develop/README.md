## Variables de entorno

Valores predeterminados Windows:

```CMD
SET PRIVATE_KEY=MIIBOgIBAAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQJAedM5dTcjeBnx3AvHY6QIJxvU+569wN9PcGF/RMJO0yI4j3UI5FgNqRcZxLqXc8lgmOFTOYP0cExtj0uW1AH0QQIhAOYQDp2vsMT2EqKOThOylFQXVQbWL0fWSMapwhof7/XlAiEAsbKbbj1QNnrYmoTSVlcW/0TGMXzLl10zIXUdJf64I40CIDfeUF5Uqv25sB7PpgA8jq65F8nYO5UbYYL0+JD1joVNAiB+3ToUwVd0Hc5ouu0EUVcM1kf9atBbd2GawGcYCjvivQIhAMQ7vzbhGEgF0Za2ttxIZYjnba0+LkxoiT2Q8mGKCXpW
SET PORT=4300
SET INTERNALKEY=40d1d424-dc37-48b1-a975-16e6fc1fa98a
SET DB_CONNECTION=postgres://postgres:admin@localhost:5430/asp-tenancy
SET AMQP_CONNECTION=amqp://rabbitmq:admin@rabbitmq-tenancy:5672
SET AMQP_EMAIL_QUEUE_NAME=email_queue
SET NEWRELIC_API_KEY=KEY
```

Linux:

```bash
export PRIVATE_KEY=MIIBOgIBAAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQJAedM5dTcjeBnx3AvHY6QIJxvU+569wN9PcGF/RMJO0yI4j3UI5FgNqRcZxLqXc8lgmOFTOYP0cExtj0uW1AH0QQIhAOYQDp2vsMT2EqKOThOylFQXVQbWL0fWSMapwhof7/XlAiEAsbKbbj1QNnrYmoTSVlcW/0TGMXzLl10zIXUdJf64I40CIDfeUF5Uqv25sB7PpgA8jq65F8nYO5UbYYL0+JD1joVNAiB+3ToUwVd0Hc5ouu0EUVcM1kf9atBbd2GawGcYCjvivQIhAMQ7vzbhGEgF0Za2ttxIZYjnba0+LkxoiT2Q8mGKCXpW
export PORT=4300
export INTERNALKEY=40d1d424-dc37-48b1-a975-16e6fc1fa98a
export DB_CONNECTION=postgres://postgres:admin@localhost:5430/asp-tenancy
export AMQP_CONNECTION=amqp://rabbitmq:admin@rabbitmq-tenancy:5672
export AMQP_EMAIL_QUEUE_NAME=email_queue
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
