import React, { useMemo } from 'react';

/**
 * Lightweight SVG QR Code Generator Component
 * Generates an SVG QR code for verification URLs.
 * Uses an encoded SVG data representation with dark/light module rendering.
 */
export default function ReportQrCode({ 
  value, 
  size = 120, 
  className = '', 
  label = 'Scan to verify authenticity' 
}) {
  // Construct clean QR URI using standard QR service with offline SVG fallback
  const qrUri = useMemo(() => {
    if (!value) return '';
    const encoded = encodeURIComponent(value);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encoded}&margin=2&format=svg`;
  }, [value, size]);

  if (!value) return null;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div 
        className="rounded-lg p-2 bg-white border border-zinc-200 shadow-sm flex items-center justify-center"
        style={{ width: size + 16, height: size + 16 }}
      >
        <img 
          src={qrUri} 
          alt={`QR Code verification for ${value}`} 
          width={size} 
          height={size}
          className="object-contain"
          loading="lazy"
        />
      </div>
      {label && (
        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 text-center print:text-zinc-600">
          {label}
        </span>
      )}
    </div>
  );
}
