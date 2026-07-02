'use client';

import { useTransition } from 'react';

export function FavoriteButton({ id, favorite }: { id: string; favorite: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="button ghost"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch(`/api/workspace/tracks/${id}/favorite`, { method: 'POST' });
          window.location.reload();
        });
      }}
    >
      {favorite ? '★ Favorited' : '☆ Favorite'}
    </button>
  );
}
