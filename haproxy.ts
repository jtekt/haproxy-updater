export type Server = {
  address: string;
  name: string;
};

export const {
  HAPROXY_DATA_PLANE_API_URL = "http://localhost:5555",
  HAPROXY_DATA_PLANE_API_USERNAME = "",
  HAPROXY_DATA_PLANE_API_PASSWORD = "",
  HAPROXY_BACKEND_NAME = "",
  HAPROXY_CHECK_PORT = "32767",
} = process.env;

async function getConfigVersion() {
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
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

export async function listBackendServers() {
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
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

export async function registerBackendServer({ address, name }: Server) {
  const version = await getConfigVersion();
  const body = {
    check: "enabled",
    health_check_port: Number(HAPROXY_CHECK_PORT),
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
  if (!response.ok) throw new Error(await response.text());
  // const text = await response.text();
}

export async function removeBackendServer(name: string) {
  const version = await getConfigVersion();

  const authHeader =
    "Basic " +
    Buffer.from(
      HAPROXY_DATA_PLANE_API_USERNAME + ":" + HAPROXY_DATA_PLANE_API_PASSWORD
    ).toString("base64");

  const init: RequestInit = {
    method: "DELETE",
    headers: {
      Authorization: authHeader,
    },
  };

  const url = `${HAPROXY_DATA_PLANE_API_URL}/v3/services/haproxy/configuration/backends/${HAPROXY_BACKEND_NAME}/servers/${name}?version=${version}`;

  const response = await fetch(url, init);
  if (!response.ok) throw new Error(await response.text());
  // const text = await response.text();
}
