"use client";

export function PortfolioError({ retry }: { retry: () => void }) {
  return <div className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-24">
    <p data-error-translate className="font-label-md text-label-md uppercase tracking-wider text-primary mb-4">Portfolio unavailable</p>
    <h1 data-error-translate className="font-headline-xl text-headline-xl mb-4">We couldn’t load the portfolio.</h1>
    <p data-error-translate className="text-on-surface-variant mb-8">Please try again in a moment.</p>
    <button data-error-translate type="button" onClick={retry} className="inline-flex rounded bg-primary-container text-on-primary-container px-5 py-3 font-label-md text-label-md uppercase">Try again</button>
  </div>;
}
