"use client";

export function PortfolioError({ retry }: { retry: () => void }) {
  return <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
    <p className="font-label-md text-label-md uppercase tracking-wider text-primary mb-4">Portfolio unavailable</p>
    <h1 className="font-headline-xl text-headline-xl mb-4">We couldn’t load the portfolio.</h1>
    <p className="text-on-surface-variant mb-8">Please try again in a moment.</p>
    <button type="button" onClick={retry} className="inline-flex rounded bg-primary-container text-on-primary-container px-5 py-3 font-label-md text-label-md uppercase">Try again</button>
  </div>;
}
