'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { BookmarkIcon } from './icons';
import AuthModal from './AuthModal';

export default function BookmarkButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="btn-bm"
        aria-label="Запази"
        onClick={e => { e.stopPropagation(); setShowModal(true); }}
      >
        <BookmarkIcon />
      </button>
      {showModal && createPortal(
        <AuthModal onClose={() => setShowModal(false)} />,
        document.body
      )}
    </>
  );
}
