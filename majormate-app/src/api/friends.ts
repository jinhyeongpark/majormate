import { API_BASE_URL } from '../../constants/api';

export type FriendStatus = 'OFFLINE' | 'STUDYING';

export interface FriendResponse {
  userId: string;
  nickname: string;
  major: string;
  status: FriendStatus;
  studyKeyword: string | null;
}

export interface FriendCodeResponse {
  friendCode: string;
}

export async function fetchFriends(): Promise<FriendResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/friends`, { credentials: 'include' });
  if (!res.ok) throw new Error('친구 목록 조회 실패');
  return res.json();
}

export async function addFriend(friendCode: string): Promise<FriendResponse> {
  const res = await fetch(`${API_BASE_URL}/api/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ friendCode }),
  });
  if (res.status === 404) throw new Error('존재하지 않는 친구 코드입니다.');
  if (!res.ok) throw new Error('친구 추가 실패');
  return res.json();
}

export async function fetchMyFriendCode(): Promise<FriendCodeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/users/me/friend-code`, { credentials: 'include' });
  if (!res.ok) throw new Error('친구 코드 조회 실패');
  return res.json();
}
