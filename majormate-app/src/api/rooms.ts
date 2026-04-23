import { API_BASE_URL } from '../../constants/api';

export interface RoomSummary {
  id: string;
  name: string;
  type: string;
  major: string;
  memberCount: number;
  maxMembers: number;
}

export interface RoomMember {
  userId: string;
  nickname: string;
  status: string;
  keyword: string | null;
  allowQuestion: boolean;
  currentStartTimeEpoch: number | null;
  accumulatedMs: number;
}

export interface RoomDetail extends RoomSummary {
  members: RoomMember[];
}

export async function fetchRooms(params?: { type?: string; major?: string }): Promise<RoomSummary[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.major) query.set('major', params.major);
  const res = await fetch(`${API_BASE_URL}/api/rooms?${query}`, { credentials: 'include' });
  if (!res.ok) throw new Error('방 목록 조회 실패');
  return res.json();
}

export async function fetchRoom(roomId: string): Promise<RoomDetail> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('방 조회 실패');
  return res.json();
}

export async function joinRoom(roomId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('방 입장 실패');
}

export async function leaveRoom(roomId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/rooms/${roomId}/leave`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

export async function createRoom(req: {
  name: string;
  type: string;
  major: string;
  maxMembers: number;
}): Promise<RoomSummary> {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('방 생성 실패');
  return res.json();
}
