export function Footer({ instagram }: { instagram: string }) {
  return (
    <footer className="bg-petal">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-3 px-4 py-6 text-center md:h-[78px] md:flex-row md:gap-6 md:py-0">
        {instagram && (
          <a
            href={`https://instagram.com/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[18px] text-wine hover:text-rose md:w-[300px]"
          >
            <span aria-hidden>◎</span>&nbsp; @{instagram}
          </a>
        )}
        <span className="hidden h-[34px] w-px bg-line md:block" aria-hidden />
        <p className="text-[15px] text-ink md:w-[530px] md:text-[17px]">Papelaria personalizada para momentos únicos ♡</p>
      </div>
    </footer>
  );
}
