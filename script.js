import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 30,
  duration: "1m",
  // baseline p95 < 50 болгож тестийг туршина.
  thresholds: {
    http_req_duration: ['p(95)<50'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status 200 байна': (r) => r.status === 200 });
  sleep(1);
}