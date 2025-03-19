import { getNodes } from "./k8s";
import {
  getConfigVersion,
  listBackendServers,
  registerBackendServer,
  HAPROXY_DATA_PLANE_API_URL,
  type Server,
  HAPROXY_BACKEND_NAME,
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

  for (const node of nodes) {
    if (
      !haProxyBackendServers
        .map(({ address }: Server) => address)
        .includes(node.address)
    ) {
      console.log(`Node ${node.name} is missing in HAProxy, adding it`);
      const haProxyConfigVersion = await getConfigVersion();
      await registerBackendServer(node, haProxyConfigVersion);
    } else {
      console.log(`Node ${node.name} EXISTS in HAProxy, skipping...`);
    }
  }

  // TODO: deal with the removal of backendServers if node does not exist
}

main();
