import Image from "next/image";

type SiteLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function SiteLogo({
  className,
  width = 300,
  height = 100,
  priority = false,
}: SiteLogoProps) {
  return (
    <Image
      src="/image.png"
      alt="VeriTrace"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
