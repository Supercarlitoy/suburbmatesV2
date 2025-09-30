import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchMetaTags from './SearchMetaTags';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SearchMetaTags />
      </Suspense>
      {children}
    </>
  );
}