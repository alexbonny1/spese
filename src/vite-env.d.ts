/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TD_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
