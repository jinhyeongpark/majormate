import { apiClient } from './client';
import { CharacterLayers } from '../../components/CharacterRenderer';

export interface ShopItem {
  id: string;
  category: string;
  name: string;
  price: number;
  filePath: string;
  owned: boolean;
}

export interface OwnedItem {
  itemId: string;
  category: string;
  name: string;
  filePath: string;
  acquiredAt: string;
}

export interface PurchaseResponse {
  balance: number;
  equippedCharacter: CharacterLayers;
}

export interface IapWebhookRequest {
  platform: 'ANDROID' | 'IOS';
  productId: string;
  receiptData: string;
  userId: string;
}

export async function fetchPoints(): Promise<number> {
  const res = await apiClient.get<{ balance: number }>('/api/users/me/points');
  return res.data.balance;
}

export async function fetchShopItems(): Promise<ShopItem[]> {
  const res = await apiClient.get<ShopItem[]>('/api/items');
  return res.data;
}

export async function fetchOwnedItems(): Promise<OwnedItem[]> {
  const res = await apiClient.get<OwnedItem[]>('/api/users/me/items');
  return res.data;
}

export async function purchaseItem(itemId: string): Promise<PurchaseResponse> {
  const res = await apiClient.post<PurchaseResponse>(`/api/users/me/items/${itemId}/purchase`);
  return res.data;
}

export async function iapWebhook(req: IapWebhookRequest): Promise<number> {
  const res = await apiClient.post<{ balance: number }>('/api/points/iap/webhook', req);
  return res.data.balance;
}
