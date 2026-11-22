/**
 * System Design Capacity Planning & Back-of-the-Envelope Math Engine
 * Calculates QPS, read/write distributions, ingress/egress bandwidth,
 * annual storage accumulation, and 80/20 RAM cache sizing.
 */

export function calculateCapacityMetrics({
  dau = 1000000,
  readWriteRatio = 10,
  avgPayloadKb = 2,
  dailyInteractionsPerUser = 20,
} = {}) {
  const safeDau = Math.max(1000, Number(dau) || 1000000);
  const safeRatio = Math.max(1, Number(readWriteRatio) || 10);
  const safePayload = Math.max(0.1, Number(avgPayloadKb) || 2);
  const safeInteractions = Math.max(1, Number(dailyInteractionsPerUser) || 20);

  const totalDailyRequests = safeDau * safeInteractions;
  const secondsPerDay = 86400;
  const avgQps = totalDailyRequests / secondsPerDay;

  const writeFraction = 1 / (safeRatio + 1);
  const readFraction = safeRatio / (safeRatio + 1);

  const writeQps = Math.round(avgQps * writeFraction * 10) / 10;
  const readQps = Math.round(avgQps * readFraction * 10) / 10;
  const peakQps = Math.round((writeQps + readQps) * 2.5 * 10) / 10;

  // Bandwidth in Mbps: QPS * KB * 8 bits / 1024 KB per MB
  const ingressBandwidthMbps = Math.round(((writeQps * safePayload * 8) / 1024) * 100) / 100;
  const egressBandwidthMbps = Math.round(((readQps * safePayload * 1.5 * 8) / 1024) * 100) / 100;

  // Daily Storage in GB: Write QPS * Payload KB * 86,400s / (1,048,576 KB/GB)
  const dailyStorageGb = Math.round(((writeQps * safePayload * secondsPerDay) / (1024 * 1024)) * 10) / 10;
  const annualStorageTb = Math.round(((dailyStorageGb * 365) / 1024) * 10) / 10;
  const fiveYearStorageTb = Math.round(annualStorageTb * 5 * 10) / 10;

  // 80/20 Rule: 20% of daily read data generates 80% of traffic -> cache memory
  const recommendedCacheMemoryGb = Math.round(dailyStorageGb * 0.2 * 10) / 10;

  return {
    totalDailyRequests,
    avgQps: Math.round(avgQps * 10) / 10,
    readQps,
    writeQps,
    peakQps,
    ingressBandwidthMbps,
    egressBandwidthMbps,
    dailyStorageGb,
    annualStorageTb,
    fiveYearStorageTb,
    recommendedCacheMemoryGb,
  };
}

export function classifyTrafficTier(qps = 0) {
  if (qps < 500) return { tier: 'LOW_TRAFFIC', label: 'Single Node / Standard', color: 'text-emerald-400' };
  if (qps < 5000) return { tier: 'MODERATE_TRAFFIC', label: 'Clustered Microservices', color: 'text-blue-400' };
  if (qps < 50000) return { tier: 'HIGH_TRAFFIC', label: 'Distributed Multi-Region', color: 'text-amber-400' };
  return { tier: 'HYPERSCALE', label: 'Global Edge Sharded', color: 'text-purple-400' };
}

export const ARCHITECTURE_PRESETS = {
  tinyurl: {
    title: 'URL Shortener (TinyURL)',
    nodes: [
      { id: 'client', type: 'CLIENT', label: 'Web / Mobile Clients', x: 50, y: 150, technology: 'Browsers', instances: 1000 },
      { id: 'lb', type: 'LOAD_BALANCER', label: 'NGINX Load Balancer', x: 250, y: 150, technology: 'NGINX / HAProxy', instances: 2 },
      { id: 'svc', type: 'MICROSERVICE', label: 'URL Redirection Service', x: 450, y: 150, technology: 'Java / Go', instances: 4 },
      { id: 'cache', type: 'CACHE', label: 'Redis Hot Cache', x: 650, y: 70, technology: 'Redis Cluster', instances: 3 },
      { id: 'db', type: 'NOSQL_DATABASE', label: 'Cassandra / DynamoDB', x: 650, y: 230, technology: 'ScyllaDB / Cassandra', instances: 3 },
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'client', targetNodeId: 'lb', protocol: 'HTTPS', synchronous: true },
      { id: 'e2', sourceNodeId: 'lb', targetNodeId: 'svc', protocol: 'HTTP/2', synchronous: true },
      { id: 'e3', sourceNodeId: 'svc', targetNodeId: 'cache', protocol: 'TCP (RESP)', synchronous: true },
      { id: 'e4', sourceNodeId: 'svc', targetNodeId: 'db', protocol: 'CQL', synchronous: true },
    ],
  },
  uber: {
    title: 'Ride Dispatch System (Uber / Lyft)',
    nodes: [
      { id: 'riders', type: 'CLIENT', label: 'Riders & Drivers', x: 50, y: 150, technology: 'iOS / Android', instances: 50000 },
      { id: 'gateway', type: 'API_GATEWAY', label: 'WebSocket Gateway', x: 250, y: 150, technology: 'Envoy / Netty', instances: 6 },
      { id: 'dispatch', type: 'MICROSERVICE', label: 'Location Dispatcher', x: 450, y: 150, technology: 'Go / gRPC', instances: 8 },
      { id: 'queue', type: 'MESSAGE_QUEUE', label: 'Kafka Ingestion Queue', x: 650, y: 70, technology: 'Apache Kafka', instances: 5 },
      { id: 'geodb', type: 'NOSQL_DATABASE', label: 'H3 Spatial Store', x: 650, y: 230, technology: 'Redis Geospatial', instances: 4 },
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'riders', targetNodeId: 'gateway', protocol: 'WEBSOCKET', synchronous: true },
      { id: 'e2', sourceNodeId: 'gateway', targetNodeId: 'dispatch', protocol: 'GRPC', synchronous: true },
      { id: 'e3', sourceNodeId: 'dispatch', targetNodeId: 'queue', protocol: 'ASYNC_EVENT', synchronous: false },
      { id: 'e4', sourceNodeId: 'dispatch', targetNodeId: 'geodb', protocol: 'TCP', synchronous: true },
    ],
  },
};
