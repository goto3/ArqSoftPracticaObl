# Propósito y alcance del proyecto

El sistema tiene como propósito fomentar la creación de bibliotecas barriales, con la finalidad de promover la cultura y facilitar el acceso a los libros. El mismo está diseñado para soportar las distintas necesidades de los usuarios, habiendo sido concebido con flexibilidad y escalabilidad en mente, pero teniendo en cuenta también el presupuesto dado y sin perder la vista de la realidad.

Esta es una plataforma SaaS para que cada una de estas bibliotecas que utilizan el sistema pueda gestionar su catálogo de libros y las reservas de los mismos.

# Variables de entorno

Variables de entorno necesarias:

Windows:

```CMD
SET PUBLIC_KEY=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQ==
SET PORT=4300
SET DB_CONNECTION=postgres://postgres:admin@localhost:5431/asp-reviews
SET AMQP_CONNECTION=amqp://rabbitmq:admin@rabbitmq-books:5672
SET AMQP_BOOKS_QUEUE_NAME=books_q_reviews
SET AMQP_BOOKS_EXCHANGE_NAME=asp-books
SET AMQP_PREFETCH_COUNT=100
SET NEWRELIC_API_KEY=KEY
```

Linux:

```bash
export PUBLIC_KEY=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQ==
export PORT=4300
export DB_CONNECTION=postgres://postgres:admin@postgres-reviews:5431/asp-reviews
export AMQP_CONNECTION=amqp://rabbitmq:admin@rabbitmq-books:5672
export AMQP_BOOKS_QUEUE_NAME=books_q_reviews
export AMQP_BOOKS_EXCHANGE_NAME=asp-books
export AMQP_PREFETCH_COUNT=100
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
