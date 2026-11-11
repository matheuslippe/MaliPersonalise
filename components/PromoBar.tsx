export function PromoBar({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-blush px-4 py-[10px] text-center text-[14px] text-wine md:h-[42px] md:py-2 md:text-[16px]">{message}</div>
  );
}
