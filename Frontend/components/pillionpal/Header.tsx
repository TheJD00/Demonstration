"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="mb-8 flex flex-col items-center gap-3 text-center">
      {/* Logo */}
      <div className="flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="PillionPal Logo"
          width={72}
          height={72}
          className="object-contain"
        />
      </div>

      {/* Product name */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          <span>Pillion</span>
          <span className="text-primary">Pal</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          FairSplit Engine
        </p>
      </div>

      {/* Tagline */}
      <p className="max-w-xl text-sm text-muted-foreground">
        Transparent cost-splitting logic between rider and pillion — the pricing
        engine that powers PillionPal.
      </p>
    </header>
  );
}
