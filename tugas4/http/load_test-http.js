import http from 'k6/http';
import { sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const responseTime = {
  '/sepuluhkb': new Trend('response_time_sepuluhkb', true, { unit: 'ms' }),
  '/seratuskb': new Trend('response_time_seratuskb', true, { unit: 'ms' }),
  '/satumb': new Trend('response_time_satumb', true, { unit: 'ms' }),
  '/limamb': new Trend('response_time_limamb', true, { unit: 'ms' }),
  '/sepuluhmb': new Trend('response_time_sepuluhmb', true, { unit: 'ms' }),
};

export const options = {
  stages: [
    { duration: '5s', target: 300 },
    { duration: '25s', target: 300 },
  ],
};

const BASE_URL = 'http://localhost:8080';
const REQUEST_TIMEOUT = '10s';

export default function () {
  const tasks = [
    { weight: 5, path: '/sepuluhkb' },
    { weight: 5, path: '/seratuskb' },
    { weight: 5, path: '/satumb' },
    { weight: 5, path: '/limamb' },
    { weight: 5, path: '/sepuluhmb' },
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
    const res = http.get(`${BASE_URL}${chosen.path}`, { timeout: REQUEST_TIMEOUT });
    const duration = Date.now() - start;

    responseTime[chosen.path].add(duration);

    if (res.status >= 200 && res.status < 400) {
    }
  } catch (err) {
  }

  sleep(0.1 + Math.random() * 1.9);
}
