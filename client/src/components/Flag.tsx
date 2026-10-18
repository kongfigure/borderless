import * as Flags from "country-flag-icons/react/3x2";
import type { CountryCode } from "@shared/types";

const COUNTRY_NAMES: Record<CountryCode, string> = {
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  AR: "Argentina",
  LT: "Lithuania",
};

export function Flag({ code, className }: { code: CountryCode; className?: string }) {
  const FlagIcon = Flags[code];
  return (
    <FlagIcon
      role="img"
      aria-label={`${COUNTRY_NAMES[code]} flag`}
      className={className ?? "h-3.5 w-5 rounded-[2px]"}
    />
  );
}
