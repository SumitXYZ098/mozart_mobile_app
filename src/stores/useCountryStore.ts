export type CountryCode = "IN" | "CA" | "US";

import * as Localization from "expo-localization";
import { create } from "zustand";

/**
 * Determine default country from device locale.
 * Falls back to US if detection fails.
 */
const getDefaultCountry = (): CountryCode => {
  const locale =
    Localization.getLocales()?.[0]?.languageTag || "";

  console.log("DEVICE LOCALE:", locale);

  if (!locale) return "US";

  const parts = locale.split("-");
  const code = parts[1]?.toUpperCase();

  if (code === "IN" || code === "CA") {
    return code as CountryCode;
  }

  return "US";
};
const defaultCountry: CountryCode = getDefaultCountry();
console.log("DEVICE LOCALE:", Localization.locale);
console.log("COUNTRY:", defaultCountry); 


/**
 * Supported country codes for pricing.
 */

interface CountryStore {
  /** Current selected country code */
  country: CountryCode;
  /** Update the country code */
  setCountry: (code: CountryCode) => void;
}

/** Zustand store for managing the user's country selection */


export const useCountryStore = create<CountryStore>((set) => ({
  country: defaultCountry,
  setCountry: (country) => set({ country }),
}));
