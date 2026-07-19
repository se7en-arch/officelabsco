import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, display: 'flex', position: 'relative' }}>
        {/* Black outer ring */}
        <div style={{
          position: 'absolute',
          width: 27, height: 27,
          top: 0, left: 0,
          borderRadius: '50%',
          background: '#111111',
        }} />
        {/* White inner cutout */}
        <div style={{
          position: 'absolute',
          width: 12, height: 12,
          top: 7.5, left: 7.5,
          borderRadius: '50%',
          background: '#ffffff',
        }} />
        {/* Orange accent dot */}
        <div style={{
          position: 'absolute',
          width: 14, height: 14,
          bottom: 0, right: 0,
          borderRadius: '50%',
          background: '#f97316',
        }} />
      </div>
    ),
    { ...size },
  );
}
