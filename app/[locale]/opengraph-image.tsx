import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'OfficeLabs Co – Премиум мебели';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0c0c0e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Green accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #1ed760 0%, #15a348 100%)',
          display: 'flex',
        }} />

        {/* Logo dot */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1ed760 0%, #15a348 100%)',
          marginBottom: 32,
          display: 'flex',
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: 18,
          color: '#1ed760',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 16,
          display: 'flex',
        }}>
          Офис мебели и обзавеждане
        </div>

        {/* Main title */}
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#f0f0f2',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: 24,
          display: 'flex',
        }}>
          OfficeLabs{' '}
          <span style={{ fontWeight: 400, opacity: 0.5, fontSize: 64 }}>co.</span>
        </div>

        {/* Description */}
        <div style={{
          fontSize: 22,
          color: '#8080a0',
          lineHeight: 1.5,
          maxWidth: 700,
          display: 'flex',
        }}>
          ASTRA · TERRA · NOVA · LOFT — четири серии, създадени за модерното работно пространство.
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          bottom: 48,
          right: 80,
          fontSize: 16,
          color: '#404050',
          display: 'flex',
        }}>
          officelabsco.com
        </div>
      </div>
    ),
    { ...size }
  );
}
