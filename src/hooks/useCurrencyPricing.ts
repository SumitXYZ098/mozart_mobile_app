import { useCountryStore } from "@/stores/useCountryStore";
import type { CountryCode } from "@/stores/useCountryStore";
import { useMemo } from "react";
  

interface CurrencyState {
  country: CountryCode;
  currency: string;
  symbol: string;
  convertedPrice: number;
  loading: boolean;
}

interface PricingOptions {
  indiaPrice: number;
  canadaPrice: number;
  usaPrice: number;
}

/**
 * Hook that returns currency information based on the user's country.
 * It reads the country from `useCountryStore` and selects the appropriate
 * price and symbol. The hook memoizes the result for performance.
 */
export const useCurrencyPricing = ({
  indiaPrice,
  canadaPrice,
  usaPrice,
}: PricingOptions): CurrencyState => {
  const country = useCountryStore((state) => state.country);

  return useMemo(() => {
    if (country === "IN") {
      return {
        country: "IN",
        currency: "INR",
        symbol: "₹",
        convertedPrice: indiaPrice,
        loading: false,
      };
    }

    if (country === "CA") {
      return {
        country: "CA",
        currency: "CAD",
        symbol: "C$",
        convertedPrice: canadaPrice,
        loading: false,
      };
    }

    // Default to United States
    return {
      country: "US",
      currency: "USD",
      symbol: "$",
      convertedPrice: usaPrice,
      loading: false,
    };
  }, [country, indiaPrice, canadaPrice, usaPrice]);
};
