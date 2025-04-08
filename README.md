# HAProxy updater

Registers nodes of a K8s cluster as backend servers in HAProxy via the Data Plane API.

## Environment variables

| Variable                        | Description                                |
| ------------------------------- | ------------------------------------------ |
| HAPROXY_DATA_PLANE_API_URL      | URL of the Dataplane API                   |
| HAPROXY_DATA_PLANE_API_USERNAME | Username for the Dataplane API             |
| HAPROXY_DATA_PLANE_API_PASSWORD | password for the Dataplane API             |
| HAPROXY_BACKEND_NAME            | Name of the backend to register servers to |
| HAPROXY_BACKEND_SERVERS_PORT    | Port for the registered backend servers    |
| HAPROXY_CHECK                   | Enable check                               |
| HAPROXY_CHECK_PORT              | Port for check                             |

## References

- https://www.haproxy.com/documentation/haproxy-data-plane-api/tutorials/backends/
