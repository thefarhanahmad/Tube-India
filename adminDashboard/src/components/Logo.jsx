import logoSrc from "../assets/logo.png";

// Bideo wordmark: a play glyph in a rounded brand tile + the name.
const Logo = ({ className = "", dark = false, compact = false }) => (
  <span
    className={`inline-flex items-center gap-3 font-display font-bold ${className}`}
  >
    <img src={logoSrc} alt="Bideo logo" className="w-20 sm:w-28 object-cover" />
  </span>
);

export default Logo;
