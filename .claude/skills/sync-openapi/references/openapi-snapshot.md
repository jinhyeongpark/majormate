# openapi.json 구조 요약

> 실제 파일: `majormate-server/docs/api/openapi.json`  
> 이 파일은 구조 파악용 요약. 항상 실제 파일을 읽어 최신 상태를 확인할 것.

## 최상위 구조

```
openapi: "3.1.0"
info.version: "1.0.0"
servers[0].url: "http://localhost:8080"
security: [{ cookieAuth: [] }]   ← 전체 API에 세션 쿠키 인증 적용
```

## Tags (도메인별)

| 태그 | 도메인 |
|---|---|
| Auth | Google OAuth2, 세션 |
| User | 사용자 프로필 |
| Character | 6-레이어 픽셀 캐릭터 |
| Friend | 친구 코드 & 목록 |
| Room | 전공방 & 커스텀 방 |
| Session | 스톱워치 세션 |
| Stats | 학습 통계 |

## 현재 Paths 목록

| Method | Path | OperationId | Tag |
|---|---|---|---|
| GET | /api/auth/me | getMe | Auth |
| POST | /api/auth/logout | logout | Auth |
| GET | /api/users/me | getMyProfile | User |
| PATCH | /api/users/me | updateMyProfile | User |
| GET | /api/users/me/character | getMyCharacter | Character |
| PUT | /api/users/me/character | updateMyCharacter | Character |
| GET | /api/users/me/friend-code | getMyFriendCode | Friend |
| GET | /api/friends | getFriends | Friend |
| POST | /api/friends | addFriend | Friend |
| GET | /api/rooms/major | getMajorRooms | Room |
| POST | /api/rooms/custom | createCustomRoom | Room |
| GET | /api/rooms/{roomId} | getRoom | Room |
| POST | /api/rooms/{roomId}/join | joinRoom | Room |
| POST | /api/rooms/{roomId}/leave | leaveRoom | Room |
| POST | /api/study-sessions/start | startSession | Session |
| POST | /api/study-sessions/stop | stopSession | Session |
| GET | /api/stats/me | getMyStats | Stats |

## 현재 Schemas 목록

| 스키마 | 용도 |
|---|---|
| UserResponse | 기본 사용자 정보 |
| ProfileResponse | UserResponse + friendCode + character |
| ProfileUpdateRequest | 프로필 수정 요청 |
| CharacterResponse | 6-레이어 캐릭터 상태 |
| CharacterUpdateRequest | 캐릭터 레이어 변경 요청 |
| FriendCodeResponse | 친구 코드 |
| FriendResponse | 친구 목록 항목 (상태 포함) |
| AddFriendRequest | 친구 추가 요청 |
| RoomResponse | 방 정보 |
| CreateRoomRequest | 커스텀 방 생성 요청 |
| StartSessionRequest | 세션 시작 요청 |
| StudySessionResponse | 세션 정보 |
| StatsResponse | 통계 데이터 |
