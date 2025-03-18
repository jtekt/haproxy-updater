import * as k8s from "@kubernetes/client-node";
import "dotenv/config";

type Server = {
  address: string;
  name: string;
};

const {
  HAPROXY_DATA_PLANE_API_URL = "http://1localhost:5555",
  HAPROXY_DATA_PLANE_API_USERNAME = "",
  HAPROXY_DATA_PLANE_API_PASSWORD = "",
  HAPROXY_BACKEND_NAME = "",
} = process.env;

async function getNodes() {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  const { items } = await k8sApi.listNode();
  const nodesFormatted = items.map((node) => ({
    name: node.metadata?.name?.split(".")?.at(0),
    address: node.status?.addresses?.at(0)?.address,
  }));

  return nodesFormatted;
}

async function getVersion() {
  const authHeader =
    "Basic " +
    Buffer.from(
      HAPROXY_DATA_PLANE_API_USERNAME + ":" + HAPROXY_DATA_PLANE_API_PASSWORD
    ).toString("base64");

  const init: RequestInit = {
    headers: {
      Authorization: authHeader,
    },
  };

  const url = `${HAPROXY_DATA_PLANE_API_URL}/v3/services/haproxy/configuration/version`;

  const response = await fetch(url, init);
  return await response.json();
}

async function listBackendServers() {
  const authHeader =
    "Basic " +
    Buffer.from(
      HAPROXY_DATA_PLANE_API_USERNAME + ":" + HAPROXY_DATA_PLANE_API_PASSWORD
    ).toString("base64");

  const init: RequestInit = {
    headers: {
      Authorization: authHeader,
    },
  };

  const url = `${HAPROXY_DATA_PLANE_API_URL}/v3/services/haproxy/configuration/backends/${HAPROXY_BACKEND_NAME}/servers`;

  const response = await fetch(url, init);
  return await response.json();
}

async function removeBackendServer(name: string, version: number) {
  // WIP
}

async function registerBackendServer(
  { address, name }: Server,
  version: string
) {
  const body = {
    check: "enabled",
    health_check_port: 16443,
    address,
    name,
  };

  const authHeader =
    "Basic " +
    Buffer.from(
      HAPROXY_DATA_PLANE_API_USERNAME + ":" + HAPROXY_DATA_PLANE_API_PASSWORD
    ).toString("base64");

  const init: RequestInit = {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };

  const url = `${HAPROXY_DATA_PLANE_API_URL}/v3/services/haproxy/configuration/backends/${HAPROXY_BACKEND_NAME}/servers?version=${version}`;

  const response = await fetch(url, init);
  // TODO: error handling
  const text = await response.text();
  console.log(text);
}
async function main() {
  const nodes = await getNodes();

  const haProxyBackendServers = await listBackendServers();

  for (const node of nodes) {
    if (!node.address) throw "Node is missing address";
    if (!node.name) throw "Node is missing name";
    if (
      !haProxyBackendServers
        .map(({ address }: any) => address)
        .includes(node.address)
    ) {
      console.log(`Node ${node.name} is missing in HAProxy, adding it`);
      const haProxyConfigVersion = await getVersion();
      // TODO: typing
      await registerBackendServer(node as any, haProxyConfigVersion);
    } else {
      console.log(`Node ${node.name} EXISTS in HAProxy`);
    }
  }

  // TODO: deal with the removal of backendServers if node does not exist
}

main();
