import * as Flags from "country-flag-icons/react/3x2";

const COUNTRY_NAMES: Record<string, string> = {
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  AR: "Argentina",
  LT: "Lithuania",
  ID: "Indonesia",
  UY: "Uruguay",
  US: "United States",
};

/** `code` is any ISO 3166-1 alpha-2 code the flag icon package supports, not
 * just the marketplace-listing `CountryCode` type — iconic-product origins
 * cover countries that never appear as a marketplace's country. */
export function Flag({ code, className }: { code: string; className?: string }) {
  const FlagIcon = Flags[code as keyof typeof Flags];
  if (!FlagIcon) return null;
  return (
    <FlagIcon
      role="img"
      aria-label={`${COUNTRY_NAMES[code] ?? code} flag`}
      className={className ?? "h-3.5 w-5 rounded-[2px]"}
    />
  );
}
