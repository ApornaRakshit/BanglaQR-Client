import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export default function AuthTopLink({ variant = "register" }) {
  const isRegister = variant === "register";

  return (
    <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 sm:text-[13px]">
      <span className="hidden sm:inline">
        {isRegister ? "Already have an account?" : "Don't have an account?"}
      </span>

      <Link
        to={isRegister ? "/login" : "/register"}
        className="
          inline-flex items-center gap-1 rounded-full
          bg-white/65 px-3 py-1.5
          font-bold text-[#008f5a]
          ring-1 ring-white/70
          shadow-sm
          backdrop-blur-sm
          transition
          hover:bg-white/85
          hover:text-[#00784b]
        "
      >
        <span>{isRegister ? "Log in" : "Sign up"}</span>
        <ArrowRight size={13} className="stroke-[2.6]" />
      </Link>
    </div>
  );
}
