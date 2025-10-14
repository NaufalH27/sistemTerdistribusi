import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const responseTime = {
  'sepuluhkb': new Trend('response_time_sepuluhkb', true, { unit: 'ms' }),
  'seratuskb': new Trend('response_time_seratuskb', true, { unit: 'ms' }),
  'satumb': new Trend('response_time_satumb', true, { unit: 'ms' }),
  'limamb': new Trend('response_time_limamb', true, { unit: 'ms' }),
  'sepuluhmb': new Trend('response_time_sepuluhmb', true, { unit: 'ms' }),
};

export const options = {
  stages: [
    { duration: '5s', target: 300 }, 
    { duration: '25s', target: 300 }, 
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
    } else {
    }
  } catch (err) {
  }

  sleep(0.1 + Math.random() * 1.9);
}
