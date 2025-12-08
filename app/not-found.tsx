import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen pt-20 pb-20 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-neutral-400 mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}

