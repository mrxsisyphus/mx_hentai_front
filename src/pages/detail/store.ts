import httpClient from '@/adapter/http/client';
import { BASE_URL } from '@/adapter/http/types';
import API from '../../middleware/api';

export function getImgLink(
  mankaId: string | undefined,
  archiveItemIndex: number,
  imgSpec: string,
) {
  return `${BASE_URL}/manka/${mankaId}/${archiveItemIndex}/${imgSpec}/link`;
}

export async function logMankaHistory(mankaId: string, mankaPage: number) {
  return await httpClient.get(`/manka/${mankaId}/log/${mankaPage}`);
}
