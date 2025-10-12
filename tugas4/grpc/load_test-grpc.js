import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const responseTime = {
  'sepuluhkb': new Trend('response_time_sepuluhkb'),
  'seratuskb': new Trend('response_time_seratuskb'),
  'satumb': new Trend('response_time_satumb'),
  'limamb': new Trend('response_time_limamb'),
  'sepuluhmb': new Trend('response_time_sepuluhmb'),
};

const successRate = {
  'sepuluhkb': new Counter('success_rate_sepuluhkb'),
  'seratuskb': new Counter('success_rate_seratuskb'),
  'satumb': new Counter('success_rate_satumb'),
  'limamb': new Counter('success_rate_limamb'),
  'sepuluhmb': new Counter('success_rate_sepuluhmb'),
};

export const options = {
  stages: [
    { duration: '30s', target: 500 }, 
  ],
};

const BASE_URL = '127.0.0.1:50051';
const client = new grpc.Client();
client.load(['fileserverpb'], 'fileserver.proto');

export default function () {
  if (!client.isConnected) {
    try {
      client.connect(BASE_URL, { plaintext: true });
    } catch (err) {
      console.error('Connection failed:', err);
      return;
    }
  }

  const tasks = [
    { weight: 5, filename: 'sepuluhkb' },
    { weight: 5, filename: 'seratuskb' },
    { weight: 5, filename: 'satumb' },
    { weight: 5, filename: 'limamb' },
    { weight: 5, filename: 'sepuluhmb' },
  ];

  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;
  let chosen = tasks[0];
  for (const t of tasks) {
    random -= t.weight;
    if (random <= 0) {
      chosen = t;
      break;
    }
  }

  const start = Date.now();
  try {
    const response = client.invoke('fileserver.FileService/GetFile', 
      { filename: chosen.filename },
      { timeout: 10000 }
    );

    const duration = Date.now() - start;
    responseTime[chosen.filename].add(duration);

    if (response && response.status === grpc.StatusOK) {
      successRate[chosen.filename].add(1);
    } else {
    }
  } catch (err) {
  }

  sleep(0.1 + Math.random() * 1.9);
}

export function handleSummary(data) {
  console.log('\nGRPC Endpoint Performance Summary:');
  console.log('-----------------------------------------------------------');
  console.log('| Endpoint   | Min (ms) | Max (ms) | Avg (ms) | Success % |');
  console.log('-----------------------------------------------------------');

  const endpoints = Object.keys(responseTime);
  endpoints.forEach((ep) => {
    const trend = data.metrics[`response_time_${ep}`];
    const counter = data.metrics[`success_rate_${ep}`];
    const success = trend && counter ? ((counter.count / trend.count) * 100).toFixed(2) : '0.00';
    if (trend) {
      console.log(`| ${ep.padEnd(10)} | ${trend.min.toFixed(2).padStart(8)} | ${trend.max.toFixed(2).padStart(8)} | ${trend.avg.toFixed(2).padStart(8)} | ${success.padStart(9)} |`);
    }
  });

  console.log('-----------------------------------------------------------\n');

  return {}; 
}
