개발 환경을 순서대로 기동한다. 각 단계를 Bash/PowerShell로 직접 실행하라.

## Step 1 — Docker Desktop 실행 여부 확인

```bash
docker info > /dev/null 2>&1 && echo "DOCKER_OK" || echo "DOCKER_DOWN"
```

- `DOCKER_OK` → 다음 단계 진행
- `DOCKER_DOWN` → **즉시 중단**하고 아래 메시지를 출력한다:

```
⏸ Docker Desktop이 꺼져 있습니다.
Docker Desktop을 켜고 완전히 로드된 뒤 /app-on을 다시 실행하세요.
```

## Step 2 — 포트 정리 (8081 · 8082 선점 프로세스 종료)

PowerShell로 실행한다:

```powershell
@(8081, 8082) | ForEach-Object {
  $port = $_
  $pids = (netstat -ano | Select-String ":$port\s") |
    ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
  foreach ($p in $pids) {
    if ($p -match '^\d+$') {
      Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
      Write-Host "Killed PID $p (port $port)"
    }
  }
}
Write-Host "Port cleanup done"
```

## Step 3 — Docker 컨테이너 (PostgreSQL + Redis)

```bash
cd majormate-server && docker compose up -d
```

## Step 4 — Spring Boot 서버 (포트 8082)

```bash
cd majormate-server && ./gradlew bootRun --args='--spring.profiles.active=local' > /tmp/majormate-server.log 2>&1 &
```

백그라운드로 실행하고, 포트 8082가 열릴 때까지 대기한다:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/auth/google -X POST -H "Content-Type: application/json" -d '{"accessToken":"x"}' | grep -qE "^[245]"; do sleep 3; done
```

## Step 5 — adb reverse (USB 기기)

```bash
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
"$ADB" reverse tcp:8082 tcp:8082 2>/dev/null && \
"$ADB" reverse tcp:8081 tcp:8081 2>/dev/null && \
echo "adb reverse 8081/8082 OK" || echo "기기 미연결 — USB 연결 후 수동으로: adb reverse tcp:8081 tcp:8081 && adb reverse tcp:8082 tcp:8082"
```

## Step 6 — Metro 번들러 (포트 8081)

```bash
cd majormate-app && npx expo start --port 8081
```

## 완료 보고

모든 단계가 완료되면 아래 형식으로 보고한다:

```
✅ 개발 환경 기동 완료
서버:  http://localhost:8082 (Spring Boot)
Metro: http://localhost:8081 (Expo)
adb:   <OK 또는 미연결 안내>

폰에서 앱을 열면 됩니다.
```
