import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 500 },
  ],
};

const client = new grpc.Client();
client.load(['fileserverpb'], 'fileserver.proto');
const BASE_URL = '127.0.0.1:50051';

export default function () {
  if (!client.isConnected) {
    try {
      client.connect(BASE_URL, { plaintext: true });
    } catch (err) {
      return;
    }
  }

  const tasks = [
    { weight: 5, filename: '' },
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

  try {
    const response = client.invoke('fileserver.FileService/GetFile', {
      filename: chosen.filename,
    });
    
    check(response, {
      'status is OK': (r) => r && r.status === grpc.StatusOK,
    });
  } catch (err) {
    console.error(`Invoke error: ${err.message}`);
  }

  sleep(0.1 + Math.random() * 1.9);
}

