declare module "expo-localization" {
  export const locale: string;
  export const isRTL: boolean;
  export const isMetric: boolean;
  export const decimalSeparator: string;
  export const groupingSeparator: string;
  export const currency: string;
  export const currencySymbol: string;
  const Localization: {
    locale: string;
    isRTL: boolean;
    isMetric: boolean;
    decimalSeparator: string;
    groupingSeparator: string;
    currency: string;
    currencySymbol: string;
  };
  export const getLocales: () => Array<{
  languageTag: string;
  countryCode?: string;
  languageCode?: string;
  isRTL?: boolean;
}>;
export default Localization;
}
