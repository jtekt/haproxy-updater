import * as k8s from "@kubernetes/client-node";

export async function getNodes() {
  const kc = new k8s.KubeConfig();

  //kc.loadFromDefault();
  kc.loadFromCluster();

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  const { items } = await k8sApi.listNode();
  const nodesFormatted = items.map((node) => {
    const name = node.metadata?.name?.split(".")?.at(0);
    const address = node.status?.addresses?.at(0)?.address;

    if (!name) throw new Error("Node is missing name");
    if (!address) throw new Error(`Node ${name} is missing an adress`);

    return { name, address };
  });

  return nodesFormatted;
}
