import Image from 'next/image';
import Link from 'next/link';

const sizes = {
  compact: 'h-20 w-20 md:h-[5.5rem] md:w-[5.5rem]',
  nav: 'h-20 w-20 sm:h-[5.25rem] sm:w-[5.25rem] md:h-28 md:w-28',
  hero: 'h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80',
} as const;

export function BrandMark({
  size = 'nav',
  linked = true,
  priority = false,
}: {
  size?: keyof typeof sizes;
  linked?: boolean;
  priority?: boolean;
}) {
  const image = (
    <Image
      src="/logo.png"
      alt="ManifestOS.studio"
      width={1254}
      height={1254}
      priority={priority}
      className={`object-contain drop-shadow-[0_0_28px_rgba(255,213,106,0.38)] ${sizes[size]}`}
    />
  );

  if (!linked) return image;

  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="ManifestOS.studio home">
      {image}
    </Link>
  );
}
