import type { CountryCode } from "@shared/types";

const FLAG_PATHS: Record<CountryCode, React.ReactNode> = {
  CN: (
    <>
      <rect width="20" height="14" fill="#DE2910" />
      <circle cx="4" cy="4" r="2" fill="#FFDE00" />
    </>
  ),
  JP: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <circle cx="10" cy="7" r="4" fill="#BC002D" />
    </>
  ),
  KR: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <circle cx="10" cy="7" r="3.5" fill="#CD2E3A" />
      <path d="M6.5 7a3.5 3.5 0 0 0 7 0a1.75 1.75 0 0 0-3.5 0a1.75 1.75 0 0 1-3.5 0z" fill="#0047A0" />
    </>
  ),
  IN: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect width="20" height="4.7" fill="#FF9933" />
      <rect y="9.3" width="20" height="4.7" fill="#138808" />
      <circle cx="10" cy="7" r="1.5" fill="none" stroke="#000080" strokeWidth={0.7} />
    </>
  ),
  AR: (
    <>
      <rect width="20" height="14" fill="#74ACDF" />
      <rect y="4.7" width="20" height="4.6" fill="#fff" />
      <circle cx="10" cy="7" r="1.2" fill="#F6B40E" />
    </>
  ),
  LT: (
    <>
      <rect width="20" height="14" fill="#C1272D" />
      <rect width="20" height="9.3" fill="#006A44" />
      <rect width="20" height="4.7" fill="#FDB913" />
    </>
  ),
};

const COUNTRY_NAMES: Record<CountryCode, string> = {
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  AR: "Argentina",
  LT: "Lithuania",
};

export function Flag({ code, className }: { code: CountryCode; className?: string }) {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      role="img"
      aria-label={`${COUNTRY_NAMES[code]} flag`}
      className={className}
    >
      {FLAG_PATHS[code]}
    </svg>
  );
}
