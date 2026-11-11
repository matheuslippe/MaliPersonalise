import Link from "next/link";

export function Logo({ size = "md", href = "/" }: { size?: "md" | "lg"; href?: string | null }) {
  const content = (
    <span className="inline-flex flex-col items-center leading-none text-wine">
      <span className={`font-serif italic ${size === "lg" ? "text-[50px]" : "text-[40px] md:text-[52px]"}`}>Mali</span>
      <span
        className={`font-sans uppercase ${size === "lg" ? "text-[14px] tracking-[0.55em]" : "text-[11px] md:text-[13px] tracking-[0.6em]"} -mr-[0.6em] mt-1`}
      >
        Personalizê
      </span>
    </span>
  );
  return href ? (
    <Link href={href} aria-label="Mali Personalizê — início">
      {content}
    </Link>
  ) : (
    content
  );
}
