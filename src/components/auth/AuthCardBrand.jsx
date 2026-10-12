import { Link } from "react-router";
import logoImg from "../../assets/logo.jpg";

export default function AuthCardBrand() {
  return (
    <div className="mb-2.5 flex items-center justify-center select-none">
      <Link to="/" title="BanglaQR Home" className="transition-transform hover:scale-105">
        <img
          src={logoImg}
          alt="BanglaQR"
          className="h-10 sm:h-11 w-auto rounded-xl object-contain shadow-xs"
        />
      </Link>
    </div>
  );
}
