interface ImportMetaEnv {
  // import.meta.env.PUBLIC_BASE_URL
  readonly PUBLIC_BASE_URL: string;
  readonly IS_TAURI: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
