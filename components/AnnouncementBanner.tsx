'use client';
import { useState } from 'react';

const ITEMS = [
  {
    icon: '🎁',
    title: 'Bundle попъп — върни честотата на "веднъж на 7 дни"',
    desc: 'Попъпите вече се управляват от Админ панел → Попъпи. Bundle попъпът е оставен на честота "При всяко зареждане" (тестов режим) — смени я на "Веднъж на X дни" (7), когато приключиш с тестването.',
  },
];

export default function AnnouncementBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(90deg, #7a0000 0%, #a00000 50%, #7a0000 100%)',
      border: '1px solid rgba(255,100,100,.25)',
      borderRadius: 12,
      marginBottom: 24,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '11px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .92 }}>
          ⚠ TO DO!
        </span>
        <span style={{ fontSize: 12, opacity: .55, marginLeft: 4 }}>
          {ITEMS.length} {ITEMS.length === 1 ? 'задача' : 'задачи'}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          opacity: .6,
          display: 'inline-block',
          transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </button>

      {open && (
        <div style={{
          padding: '0 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {ITEMS.map((item) => (
            <div key={item.title} style={{
              display: 'flex',
              gap: 12,
              padding: '10px 14px',
              background: 'rgba(0,0,0,.22)',
              borderRadius: 8,
              borderLeft: '3px solid rgba(255,255,255,.22)',
            }}>
              <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.76)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
