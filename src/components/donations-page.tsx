"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Clipboard, HandHeart, Heart } from "lucide-react";
import { Brand } from "@/components/brand";
import { SiteMenu } from "@/components/site-menu";

// Fill these public donation details when the receiving account is ready.
// Do not put a CVC, PIN, password, or one-time banking code here.
export const MUSIC_CORE_DONATION_CARD_IMAGE_URL = ""; // Direct URL to the hosted Music Core card PNG/JPG.
export const MUSIC_CORE_DONATION_PAYMENT_URL = ""; // Optional hosted payment link from your bank/provider.
export const MUSIC_CORE_DONATION_CARDHOLDER = "";
export const MUSIC_CORE_DONATION_CARD_NUMBER = "";
export const MUSIC_CORE_DONATION_BANK = "";

export function DonationsPage() {
  const [copied, setCopied] = useState(false);
  const detailsReady = Boolean(MUSIC_CORE_DONATION_CARD_NUMBER || MUSIC_CORE_DONATION_PAYMENT_URL);

  async function copyCardNumber() {
    if (!MUSIC_CORE_DONATION_CARD_NUMBER || !navigator.clipboard) return;
    await navigator.clipboard.writeText(MUSIC_CORE_DONATION_CARD_NUMBER);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return <div className="site-shell utility-page-shell">
    <header className="site-header"><div className="header-inner"><Brand /><div className="utility-header-side"><span>ПОДДЕРЖАТЬ MUSIC CORE</span><SiteMenu /></div></div></header>
    <main className="donation-page-main">
      <Link href="/" className="profile-back"><ArrowLeft size={15} /> К АЙСБЕРГУ</Link>
      <section className="donation-intro"><span className="eyebrow"><span className="orange-dot" /> SC ICEBERG BY MUSIC CORE</span><h1>Помоги льду<br /><em>двигаться дальше.</em></h1><p>Мы будем рады поддержке на развитие музыкального архива. Любое пожертвование добровольное — слушай и поддерживай только если тебе хочется.</p></section>
      <section className="donation-content">
        <div className="donation-artwork-wrap">
          {MUSIC_CORE_DONATION_CARD_IMAGE_URL ? <Image src={MUSIC_CORE_DONATION_CARD_IMAGE_URL} alt="Карта MUSIC CORE" fill sizes="(max-width: 800px) 100vw, 760px" unoptimized className="donation-card-image" /> : <div className="donation-card-placeholder"><div className="placeholder-chip"/><span className="placeholder-wave">)))</span><div className="placeholder-logo"><Heart size={21} fill="currentColor" /><span>MUSIC<br />CORE</span></div><small>SC ICEBERG · SUPPORT CARD</small></div>}
        </div>
        <aside className="donation-details-card"><span className="eyebrow muted">ЕСЛИ ХОЧЕШЬ ПОДДЕРЖАТЬ</span><h2>Спасибо, что слушаешь.</h2><p>Поддержка помогает развивать архив, находить новые имена и сохранять музыку под поверхностью.</p>
          {detailsReady ? <div className="donation-payment-details">
            {MUSIC_CORE_DONATION_BANK && <div><small>БАНК / СПОСОБ</small><strong>{MUSIC_CORE_DONATION_BANK}</strong></div>}
            {MUSIC_CORE_DONATION_CARDHOLDER && <div><small>ПОЛУЧАТЕЛЬ</small><strong>{MUSIC_CORE_DONATION_CARDHOLDER}</strong></div>}
            {MUSIC_CORE_DONATION_CARD_NUMBER && <div className="donation-card-number"><div><small>НОМЕР КАРТЫ</small><strong>{MUSIC_CORE_DONATION_CARD_NUMBER}</strong></div><button onClick={copyCardNumber} aria-label="Скопировать номер"><Clipboard size={16}/></button></div>}
            {MUSIC_CORE_DONATION_PAYMENT_URL && <a className="donation-pay-button" href={MUSIC_CORE_DONATION_PAYMENT_URL} target="_blank" rel="noopener noreferrer">Перейти к пожертвованию <ArrowUpRight size={16}/></a>}
          </div> : <div className="donation-details-placeholder"><HandHeart size={18}/><span>Реквизиты для поддержки появятся здесь.</span></div>}
          <p className="donation-thanks">Без подписок и обязательств. Спасибо за любое внимание к проекту.</p>
        </aside>
      </section>
    </main>
    <footer className="site-footer utility-footer"><Brand /><span>MUSIC CORE · СПАСИБО ЗА ПОДДЕРЖКУ ♡</span><Link href="/">К АЙСБЕРГУ</Link></footer>
  </div>;
}
