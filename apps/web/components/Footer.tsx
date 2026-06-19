const UTM_URL =
  "https://context.dev?utm_source=contextdev-monitor&utm_medium=app&utm_campaign=oss";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-between">
        <p className="font-sans text-sm text-muted">
          Powered by{" "}
          <a
            href={UTM_URL}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline hover:text-primary-strong transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            context.dev
          </a>
        </p>
        <p className="font-sans text-sm text-muted">
          MIT License &mdash; open source
        </p>
      </div>
    </footer>
  );
}
