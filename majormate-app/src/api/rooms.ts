import { API_BASE_URL } from '../../constants/api';

export interface RoomSummary {
  id: string;
  name: string;
  type: 'MAJOR' | 'CUSTOM';
  major: string | null;
  memberCount: number;
  maxMembers: number;
  createdByMe: boolean;
}

export interface RoomInvitation {
  id: string;
  roomId: string;
  roomName: string;
  inviterNickname: string;
  createdAt: string;
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

export async function fetchMyRooms(): Promise<RoomSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, { credentials: 'include' });
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
  const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/leave`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('방 탈퇴 실패');
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

export async function createCustomRoom(params: {
  name: string;
  inviteeUserIds: string[];
}): Promise<RoomSummary> {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name: params.name, type: 'CUSTOM', inviteeUserIds: params.inviteeUserIds }),
  });
  if (!res.ok) throw new Error('방 생성 실패');
  return res.json();
}

export async function inviteToRoom(roomId: string, inviteeUserId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ inviteeUserId }),
  });
  if (!res.ok) throw new Error('초대 실패');
}

export async function fetchReceivedInvitations(): Promise<RoomInvitation[]> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/invitations/received`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('받은 초대 조회 실패');
  return res.json();
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/invitations/${invitationId}/accept`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('초대 수락 실패');
}

export async function declineInvitation(invitationId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/invitations/${invitationId}/decline`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('초대 거절 실패');
}
