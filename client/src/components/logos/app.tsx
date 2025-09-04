import Image from "next/image";

interface AppLogoProps {
    width?: number;
    height?: number;
    className?: string;
}

const AppLogo = ({ width = 24, height = 24, className }: AppLogoProps) => (
    <Image
        src="/logo.png"
        alt="Fino"
        width={width}
        height={height}
        className={className}
    />
);

export default AppLogo;
