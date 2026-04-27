import { apiClient } from './client';

export interface QaRequestResponse {
  id: string;
  requesterId: string;
  requesterNickname: string;
  targetId: string;
  targetNickname: string;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  chatRoomId: string | null;
  createdAt: string;
}

export interface ChatMessageResponse {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderNickname: string;
  content: string;
  createdAt: string;
}

export async function sendQaRequest(
  targetUserId: string,
  message?: string,
): Promise<QaRequestResponse> {
  const res = await apiClient.post<QaRequestResponse>('/api/qa/request', {
    targetUserId,
    message: message || null,
  });
  return res.data;
}

export async function acceptQaRequest(requestId: string): Promise<QaRequestResponse> {
  const res = await apiClient.post<QaRequestResponse>(`/api/qa/${requestId}/accept`);
  return res.data;
}

export async function rejectQaRequest(requestId: string): Promise<QaRequestResponse> {
  const res = await apiClient.post<QaRequestResponse>(`/api/qa/${requestId}/reject`);
  return res.data;
}

export async function fetchChatHistory(chatRoomId: string): Promise<ChatMessageResponse[]> {
  const res = await apiClient.get<ChatMessageResponse[]>(`/api/qa/chat/${chatRoomId}/history`);
  return res.data;
}
