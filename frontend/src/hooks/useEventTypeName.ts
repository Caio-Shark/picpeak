import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventTypesService } from '../services/eventTypes.service';

/**
 * Resolves an event's `event_type` (the slug prefix stored on the event, e.g.
 * "wedding") to the display name configured under Settings → Event Types
 * (e.g. "Casamento"). Falls back to the raw value while loading or when the
 * type no longer exists, so callers can render it unconditionally.
 */
export function useEventTypeName() {
  const { data } = useQuery({
    queryKey: ['event-types', 'all-for-labels'],
    queryFn: () => eventTypesService.getEventTypes(true),
    staleTime: 5 * 60 * 1000,
  });
  return useCallback(
    (slug?: string | null) => {
      if (!slug) return '';
      const match = data?.find((type) => type.slug_prefix === slug);
      return match?.name || slug;
    },
    [data],
  );
}
