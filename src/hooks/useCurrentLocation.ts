import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

export const useCurrentLocation = (): string => {
  const { asPath, locale } = useRouter();
  const currentLocation = useRef<string>('');

  useEffect(() => {
    currentLocation.current = [window.location.origin, locale, asPath]
      .filter((str) => str)
      .join('/');
  });

  return currentLocation.current;
};
