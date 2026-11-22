import Image from "next/image";
import Link from "next/link";

// Paste the hosted PNG logo URL here when it's ready.
export const MUSIC_CORE_LOGO_URL = "";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand ${light ? "brand-light" : ""}`} aria-label="SC ICEBERG by MUSIC CORE — на главную">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M3 21.3 13.6 8.6l4.7 6.1 3.8-4.3L33 21.3H3Z" fill="currentColor" />
          <path d="M6 24h24l-11.9 8L6 24Z" fill="currentColor" opacity=".43" />
          <path d="M2 22.7h32" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      <span className="brand-name">
        <span className="brand-name-main">SC ICEBERG</span>
        <span className="brand-name-by">by <b>MUSIC CORE</b></span>
      </span>
      <span className="brand-separator" aria-hidden="true" />
      <span className="brand-logo-slot" aria-label="Логотип MUSIC CORE">
        {MUSIC_CORE_LOGO_URL ? <Image src={MUSIC_CORE_LOGO_URL} alt="MUSIC CORE" width={34} height={34} unoptimized /> : <span className="brand-logo-placeholder">MC</span>}
      </span>
    </Link>
  );
}
