declare module 'react-i18next' {
  export function useTranslation(): {
    t: (key: string) => string;
    i18n: any;
  };
}