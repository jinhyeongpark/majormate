import { API_BASE_URL } from '../../constants/api';

export interface Major {
  id: number;
  nameKo: string;
  nameEn: string;
  category: string;
}

export async function fetchMajors(): Promise<Major[]> {
  const res = await fetch(`${API_BASE_URL}/api/majors`);
  if (!res.ok) throw new Error('전공 목록 조회 실패');
  return res.json();
}
