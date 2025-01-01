interface ImportMetaEnv {
    // import.meta.env.PUBLIC_BASE_URL
    readonly PUBLIC_BASE_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }