# Лаборатори №2: Гүйцэтгэлийн хэмжүүр (K6)
Программ хангамжийн чанарын баталгаа ба тест (F.CSA313)

**B232270052 С. Азжаргал**

---

## Орчин

- OS: Windows
- k6 version:
```
k6.exe v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64)
```
- Тестийн зорилтот сервер (Алхам 2–4): `https://test.k6.io`
- Локал сервер (Алхам 5): Express.js, `http://localhost:3000`

## Алхам 2. Baseline (5 VU, 30s)

| Хэмжигдэхүүн | Утга |
|---|---|
| avg | 778.37ms |
| p90 | 1.77s |
| p95 | 2.43s |
| throughput (http_reqs) | 100 нийт хүсэлт, 3.049876/s |
| error rate (http_req_failed) | 0.00% (0/100) |

"Анхны тест" утгатай commit дээр `results/run-05vu.txt` (Алхам 3 дээр ижил нэртэй ажиллуулсан учраас өөрчлөгдсөн) үр дүнг файлаар оруулсан. Зурган байдлаар `docs/run_baseline.png` оруулсан. Энэ p95 = 2.43s утгыг Алхам 4-ийн SLO тооцоход baseline болгон ашигласан.

## Алхам 3. Ачааллыг шатлан өсгөх (5 / 30 / 100 VU, тус бүрд 1 минут)

| VU | p90 | p95 | Throughput | Error rate |
|---|---|---|---|---|
| 5 | 1.41s | 1.80s | 4.00288/s (250 нийт) | 0.00% |
| 30 | 1.76s | 2.55s | 16.363563/s (1236 нийт) | 0.00% |
| 100 | 2.25s | 3.26s | 39.798784/s (3582 нийт) | 0.22% (8/3582) |

**Хавсаргасан текст файл болон зураг:**
- `docs/run_5vu.png`, `results/run-05vu.txt`
- `docs/run_30vu.png`, `results/run-30vu.txt`
- `docs/run_100vu.png`, `results/run-100vu.txt`
- `docs/run_stages.png`,`results/run_stages.txt` — stages ашигласан үр дүн

`stages`-тэй хувилбар (`script-stages.js`, 5→30→100→0) нь ачааллын ерөнхий хандлагыг ажиглах зорилгоор хийгдсэн бөгөөд дээрх хүснэгтийн тоон утгуудыг тусдаа ажиллуулалтын гаралтын файлуудаас авсан.

## Алхам 4 — Threshold (SLO)

**SLO тооцоо:** baseline p95 (2.43s) × 1.5 = **3650ms**. Энэ коэффициентийг сонгосон шалтгаан нь энгийн ачааллаас дунджаар 50%-иар удаан хариу өгөхийг зөвшөөрөх боловч цаашид систем хэт удаашрахаас сэргийлэх зорилготой.

```javascript
thresholds: {
  http_req_duration: ['p(95)<3650'],
  http_req_failed:   ['rate<0.01'],
},
```

| Тест | Threshold | Бодит утга | Үр дүн |
|---|---|---|---|
| PASS (30 VU, 1m) | p(95)<3650ms | 1.34s | ✓ PASS |
| PASS | rate<0.01 | 0.00% | ✓ PASS |
| FAIL (30 VU, 1m) | p(95)<50ms | 372.53ms | ✗ FAIL |
| FAIL | rate<0.01 | 0.00% | ✓ PASS |

**Хавсаргасан файл болон зураг:**
- `results/run-threshold-pass.txt`, `docs/threshold_passed.png`
- `results/run-threshold-fail.txt`, `docs/threshold_failed.png`

FAIL тестийн үед k6 `ERRO[0062] thresholds on metrics 'http_req_duration' have been crossed` гэсэн алдаа заан non-zero exit code буцаасан бөгөөд энэ нь CI/CD pipeline дээр Quality Gate ажиллаж pipeline-ийг зогсоох зарчимтай нийцэж байна.

## Алхам 5 — Локал сервер (Express)

`/` (шууд хариу) ба `/slow` (100ms хойшлуулсан хариу) endpoint-уудыг 30 VU, 30s тестлэв.

| Endpoint | p90 | p95 | Throughput | Error rate |
|---|---|---|---|---|
| `/` | 6.68ms | 16.05ms | 29.804769/s (900 нийт) | 0.00% |
| `/slow` | 119.76ms | 126.82ms | 26.914268/s (810 нийт) | 0.00% |

**Хавсаргасан файл болон зураг:**
- `docs/run_localhost_fast.png`, `results/run-localhost-fast.txt`
- `docs/run_localhost_slow.png`, `results/run-localhost-slow.txt`

## Дүгнэлт

Энэхүү лабораторийн ажлаар k6 хэрэгслийг ашиглан системд ачаалал өгөхөд гүйцэтгэлийн үндсэн хэмжүүрүүд хэрхэн өөрчлөгддөгийг туршиж үзлээ. Туршилтын үр дүнгээс харахад зэрэгцээ хэрэглэгчийн тоо (VU) 5-аас 100 болж өсөхөд p95 latency нь 1.80s-ээс 3.26s болж нэмэгдсэн ба хэрэглэгчийн тоо нэмэгдэхэд хариу удааширсан. Мөн throughput 4.00 req/s-ээс 39.80 req/s болж хэрэглэгч нэмэгдэхэд нэг секундэд боловсруулах хүсэлтийн тоо ихэссэн байна. Энэ нь ачаалал өсөх тутам throughput тодорхой хязгаар хүртэл өсөх боловч нэгж хэрэглэгчид ирэх хариуны хугацаа (latency) урт болдгийг харуулж байна. Мөн 100 VU ачааллын үед 0.22% error rate (8 хүсэлт унасан) нь системийн найдвартай байдал хэрэглэгч ихсэх үед буурч байгааг харж болно. Baseline хэмжилт дээр үндэслэн тодорхойлсон p95 < 3650ms SLO босго утга нь 30 VU ачаалалтай үед 1.34s буюу бүрэн биелж PASS үр дүн үзүүлэв. Харин босго утгыг санаатайгаар p95 < 50ms болгож чангаруулахад k6 нь non-zero exit code буцааж, CI/CD орчинд Quality Gate болж ажиллах зарчмыг харууллаа. Локал Express сервер дээрх туршилтаар сааталгүй эндпойнт нь хариу удаашруулдаг эндпойнтоос latency-ийн хувьд хэд дахин хурдан хариу өгч байгааг баталгаажуулсан. Дүгнэж хэлэхэд, санамсаргүй утгаас илүүтэйгээр p90, p95 баримтлан SLO тохируулах нь бодит хэрэглэгчдийн туршлагыг үнэлэх хамгийн оновчтой арга болохыг ойлгож авлаа.

## Reproduce хийх

```powershell
# 1. Алхам 3 турших
k6 run script.js | Tee-Object -FilePath results\run-05vu.txt
k6 run --vus 30 --duration 1m script.js | Tee-Object -FilePath results\run-30vu.txt
k6 run --vus 100 --duration 1m script.js | Tee-Object -FilePath results\run-100vu.txt

# 2. Локал серверийг асаах
node server.js

# 3. Локал сервер рүү тест хийх
k6 run localhost-fast.js | Tee-Object -FilePath results\run-localhost-fast.txt
k6 run localhost-slow.js | Tee-Object -FilePath results\run-localhost-slow.txt
```
