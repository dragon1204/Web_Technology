import "./header.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Header = () => {
    const pathname = usePathname();

    const title = pathname.split("/").filter(Boolean)[0]?.toUpperCase() ?? "";

    return (
        <div className="header">
            <Link href="/dashboard">
                <Image
                    src="/home.png"
                    width={20}
                    height={20}
                    alt="homepage"
                    className="home-icon"
                />
            </Link>

            <Image
                src="/greater-than-symbol.png"
                height={20}
                width={20}
                alt="next-icon"
                className="next-icon"
            />

            <h1 className="header-title">{title}</h1>
        </div>
    );
};

export default Header;
