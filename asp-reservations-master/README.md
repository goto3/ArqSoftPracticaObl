# Reservations

Microservicio encargadco de realizar el manejo de las reservas de los libros.

# Ambiente de desarrollo : Docker-Compose

`$ docker-compose -f docker-compose.debug.yml up -d --build`

## Requerimientos

-   docker 20.10.8
-   docker-compose 1.29.2

# Environment

Windows:
```CMD
SET PUBLIC_KEY=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQ==
SET PORT=4303
SET DBHOST=localhost
SET DBPORT=5433
SET DBNAME=asp-reservations
SET DBUSER=postgres
SET DBPASSWORD=admin
SET NEWRELIC_API_KEY=KEY
```

Linux:

```bash
export PUBLIC_KEY=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ+xnPP69wuuiLmiK7RwtZs1tA0gl+PNXvjGV6cJLHPbELaMGq38lsJbmFHNYfBwqw2hao9GEeo5wrMATFhgviECAwEAAQ==
export PORT=4303
export DBHOST=localhost
export DBPORT=5433
export DBNAME=asp-reservations
export DBUSER=postgres
export DBPASSWORD=admin
export NEWRELIC_API_KEY=KEY
```
