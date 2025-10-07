import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 2000 }, 
    { duration: '40s', target: 2000 }, 
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],  
    http_req_duration: ['p(95)<10000'], 
  },
};

const BASE_URL = 'http://localhost:8080';
const REQUEST_TIMEOUT = '10s'; 

export default function () {
  const tasks = [
    { weight: 5, path: '/' },
    { weight: 5, path: '/sepuluhkb' },
    { weight: 5, path: '/seratuskb' },
    { weight: 5, path: '/satumb' },
    { weight: 5, path: '/limamb' },
    { weight: 5, path: '/sepuluhmb' },
  ];

  // Weighted random selection
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

  // Perform request
  http.get(`${BASE_URL}${chosen.path}`, { timeout: REQUEST_TIMEOUT });

  // Random sleep between 0.1 and 2 seconds (like Locust’s between())
  sleep(0.1 + Math.random() * 1.9);
}
