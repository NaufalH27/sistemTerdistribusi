import http from 'k6/http';
import { sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const responseTime = {
  '/sepuluhkb': new Trend('response_time_sepuluhkb'),
  '/seratuskb': new Trend('response_time_seratuskb'),
  '/satumb': new Trend('response_time_satumb'),
  '/limamb': new Trend('response_time_limamb'),
  '/sepuluhmb': new Trend('response_time_sepuluhmb'),
};

const successRate = {
  '/sepuluhkb': new Counter('success_rate_sepuluhkb'),
  '/seratuskb': new Counter('success_rate_seratuskb'),
  '/satumb': new Counter('success_rate_satumb'),
  '/limamb': new Counter('success_rate_limamb'),
  '/sepuluhmb': new Counter('success_rate_sepuluhmb'),
};

export const options = {
  stages: [
    { duration: '30s', target: 500 },
  ],
};

const BASE_URL = 'http://localhost:8081';
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
      successRate[chosen.path].add(1);
    }
  } catch (err) {
    console.error(`Request failed on ${chosen.path}: ${err}`);
  }

  sleep(0.1 + Math.random() * 1.9);
}

export function handleSummary(data) {
  console.log('\nEndpoint Performance Summary:');
  console.log('-----------------------------------------------------------');
  console.log('| Endpoint   | Min (ms) | Max (ms) | Avg (ms) | Success % |');
  console.log('-----------------------------------------------------------');

  const endpoints = Object.keys(responseTime);
  endpoints.forEach((ep) => {
    const trend = data.metrics[`response_time_${ep.slice(1)}`];
    const counter = data.metrics[`success_rate_${ep.slice(1)}`];
    const success = trend && counter ? ((counter.count / trend.count) * 100).toFixed(2) : '0.00';
    if (trend) {
      console.log(`| ${ep.padEnd(10)} | ${trend.min.toFixed(2).padStart(8)} | ${trend.max.toFixed(2).padStart(8)} | ${trend.avg.toFixed(2).padStart(8)} | ${success.padStart(9)} |`);
    }
  });

  console.log('-----------------------------------------------------------\n');

  return {}; 
}
