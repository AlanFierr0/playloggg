import Link from "next/link";
export default function NotFound() {
  return <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24"><p className="font-label-md text-label-md uppercase tracking-wider text-primary mb-4">404 / Archive entry unavailable</p><h1 className="font-headline-xl text-headline-xl mb-4">This title isn’t in the prototype.</h1><p className="text-on-surface-variant mb-8">Search the sample catalog or return to your profile.</p><Link href="/search?q=" className="inline-flex rounded bg-primary-container text-on-primary-container px-5 py-3 font-label-md text-label-md uppercase">Search titles</Link></div>;
}
