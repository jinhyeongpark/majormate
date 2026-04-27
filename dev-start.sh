#!/bin/bash
# MajorMate 개발 서버 일괄 시작 스크립트
# 사용법: bash dev-start.sh

set -e

echo "=== MajorMate Dev Start ==="

# 1. Docker (PostgreSQL + Redis)
echo "[1/4] Docker 컨테이너 시작..."
cd majormate-server
docker compose up -d
cd ..

# 2. Spring Boot 서버
echo "[2/4] Spring Boot 서버 시작 (포트 8082)..."
cd majormate-server
./gradlew bootRun --args='--spring.profiles.active=local' &
SERVER_PID=$!
cd ..
echo "    서버 PID: $SERVER_PID"

# 3. ADB reverse (USB 연결된 경우)
echo "[3/4] ADB reverse 설정 (USB 기기)..."
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
if [ -f "$ADB" ]; then
  "$ADB" reverse tcp:8082 tcp:8082 2>/dev/null && echo "    8082 터널 OK" || echo "    기기 미연결, 스킵"
  "$ADB" reverse tcp:8081 tcp:8081 2>/dev/null || true
else
  echo "    adb 없음, 스킵"
fi

# 4. Metro 번들러
echo "[4/4] Metro 번들러 시작 (포트 8081)..."
cd majormate-app
npx expo start --port 8081
