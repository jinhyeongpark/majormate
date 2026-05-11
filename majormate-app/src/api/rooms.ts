import { apiClient } from './client';

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

export async function fetchMyRooms(): Promise<RoomSummary[]> {
  const res = await apiClient.get<RoomSummary[]>('/api/rooms');
  return res.data;
}

export async function fetchRoom(roomId: string): Promise<RoomDetail> {
  const res = await apiClient.get<RoomDetail>(`/api/rooms/${roomId}`);
  return res.data;
}

export async function joinRoom(roomId: string): Promise<void> {
  await apiClient.post(`/api/rooms/${roomId}/join`);
}

export async function leaveRoom(roomId: string): Promise<void> {
  await apiClient.delete(`/api/rooms/${roomId}/leave`);
}

export async function createRoom(req: {
  name: string;
  type: string;
  major: string;
  maxMembers: number;
}): Promise<RoomSummary> {
  const res = await apiClient.post<RoomSummary>('/api/rooms', req);
  return res.data;
}

export async function createCustomRoom(params: {
  name: string;
  inviteeUserIds: string[];
}): Promise<RoomSummary> {
  const res = await apiClient.post<RoomSummary>('/api/rooms', {
    name: params.name,
    type: 'CUSTOM',
    inviteeUserIds: params.inviteeUserIds,
  });
  return res.data;
}

export async function inviteToRoom(roomId: string, inviteeUserId: string): Promise<void> {
  await apiClient.post(`/api/rooms/${roomId}/invitations`, { inviteeUserId });
}

export async function fetchReceivedInvitations(): Promise<RoomInvitation[]> {
  const res = await apiClient.get<RoomInvitation[]>('/api/rooms/invitations/received');
  return res.data;
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  await apiClient.post(`/api/rooms/invitations/${invitationId}/accept`);
}

export async function declineInvitation(invitationId: string): Promise<void> {
  await apiClient.post(`/api/rooms/invitations/${invitationId}/decline`);
}
