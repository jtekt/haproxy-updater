import "dotenv/config";
import { getNodes } from "./k8s";
import {
  listBackendServers,
  registerBackendServer,
  HAPROXY_DATA_PLANE_API_URL,
  type Server,
  HAPROXY_BACKEND_NAME,
  removeBackendServer,
} from "./haproxy";

async function main() {
  console.log("Querying K8s for nodes...");
  const nodes = await getNodes();
  console.log(`Cluster has ${nodes.length} node(s)`);

  console.log(
    `Querying HAProxy at ${HAPROXY_DATA_PLANE_API_URL} for servers of backend ${HAPROXY_BACKEND_NAME}...`
  );
  const haProxyBackendServers = await listBackendServers();
  console.log(
    `HAProxy has ${haProxyBackendServers.length} registered backend server(s)`
  );

  // Registering nodes that are not servers yet
  console.log(`Registering nodes in HAproxy...`);
  for (const node of nodes) {
    const nodeIsInHaProxy = haProxyBackendServers
      .map(({ address }: Server) => address)
      .includes(node.address);

    if (!nodeIsInHaProxy) {
      console.log(`Node ${node.name} is missing in HAProxy, adding it...`);
      await registerBackendServer(node);
      console.log(`Node ${node.name} added to HAProxy`);
    } else {
      console.log(`Node ${node.name} is already registered in HAPrroxy`);
    }
  }

  // Deregistering servers that are not nodes
  console.log(`Unregistering deleted nodes from HAproxy...`);
  for (const server of haProxyBackendServers) {
    const serverIsNode = nodes
      .map(({ address }: Server) => address)
      .includes(server.address);

    if (!serverIsNode) {
      console.log(
        `Server ${server.name} is not a node, removing it from HAProxy...`
      );
      await removeBackendServer(server.name);
      console.log(`Server ${server.name} removed from HAProxy`);
    }
  }
}

main();
