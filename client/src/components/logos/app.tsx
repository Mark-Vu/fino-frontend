import Image from "next/image";

const AppLogo = () => (
    <Image
        src="/logo.png"
        alt="Fino"
        width={24}
        height={24}
        className="w-full h-full"
    />
);
export default AppLogo;
