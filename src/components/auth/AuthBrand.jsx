import { Link } from "react-router";
import logoImg from "../../assets/logo.jpg";

export default function AuthBrand({ className = "" }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center select-none ${className}`}
    >
      <img
        src={logoImg}
        alt="BanglaQR"
        className="h-10 sm:h-11 w-auto rounded-xl object-contain shadow-xs transition-transform hover:scale-105"
      />
    </Link>
  );
}
