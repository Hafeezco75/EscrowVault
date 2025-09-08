// Sui contract details and type declarations

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PACKAGE_ID: string;
      NEXT_PUBLIC_OBJECT_ID: string;
    }
  }
}

declare const PACKAGE_ID: string;
declare const OBJECT_ID: string;

export {};