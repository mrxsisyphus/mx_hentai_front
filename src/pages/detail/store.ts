import API from '../../middleware/api';

export function getImgLink(
  mankaId: string | undefined,
  archiveItemIndex: number,
  imgSpec: string,
) {
  return `${API.defaults.baseURL}/manka/${mankaId}/${archiveItemIndex}/${imgSpec}/link`;
}

export async function logMankaHistory(mankaId: string, mankaPage: number) {
  return await API.get(`/manka/${mankaId}/log/${mankaPage}`);
}
