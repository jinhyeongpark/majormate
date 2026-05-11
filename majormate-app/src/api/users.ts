import { apiClient } from './client';
import { CharacterLayers } from '../../components/CharacterRenderer';

export async function fetchUserCharacter(userId: string): Promise<CharacterLayers> {
  const res = await apiClient.get<CharacterLayers>(`/api/users/${userId}/character`);
  return res.data;
}
