import { TauriHttpClient } from './tauri-http';
import type { HttpClient } from './types';
import { WebHttpClient } from './web-http';

const httpClient: HttpClient = process.env.IS_TAURI
  ? new TauriHttpClient()
  : new WebHttpClient();

export default httpClient;
