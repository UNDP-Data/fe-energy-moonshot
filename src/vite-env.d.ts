/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASSISTANT_PROXY_BASE_URL?: string;
  readonly VITE_MOONSHOT_PROXY_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
