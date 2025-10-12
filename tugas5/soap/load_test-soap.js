import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 500 }, 
  ],
};

const BASE_URL = 'http://localhost:8081';
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

  try {
    const res = http.get(`${BASE_URL}${chosen.path}`, { timeout: REQUEST_TIMEOUT });
    
    if (res.status >= 500) {
      console.error(`Server error on ${chosen.path}: ${res.status}`);
    }
  } catch (err) {
    console.error(`Request failed: ${err}`);
  }

  sleep(0.1 + Math.random() * 1.9);
}
