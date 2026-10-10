/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the Register buttons send students (Unstop or any other host). */
  readonly VITE_REGISTER_URL?: string;
  /** Address used by the "Email us your approach" button. */
  readonly VITE_CONTACT_EMAIL?: string;
  /** Only needed when the API is hosted on a different origin than the site. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
