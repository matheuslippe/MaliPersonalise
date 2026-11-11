import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-3 rounded-[30px] bg-rose text-white transition-colors hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-60";

const sizes = {
  lg: "h-[60px] px-10 text-[20px] md:h-[70px] md:w-[340px] md:text-[22px]",
  md: "h-[52px] px-8 text-[18px] md:text-[20px]",
  sm: "h-11 px-6 text-[16px]",
};

export function ButtonLink({
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { size?: keyof typeof sizes }) {
  return <Link {...props} className={`${base} ${sizes[size]} ${className}`} />;
}

export function Button({
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { size?: keyof typeof sizes }) {
  return <button {...props} className={`${base} ${sizes[size]} ${className}`} />;
}

export function SecondaryButton({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center rounded-[30px] border border-line bg-white px-6 text-[16px] text-wine transition-colors hover:border-rose hover:text-rose disabled:opacity-60 ${className}`}
    />
  );
}
