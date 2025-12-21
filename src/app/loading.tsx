import GlobalLoader from '@/components/GlobalLoader';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <GlobalLoader />
    </div>
  );
}
