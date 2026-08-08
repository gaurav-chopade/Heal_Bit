import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";

// Public top bar. A single "Sign in" control that takes you to the role chooser
// (the cards on the home page), which is the one place to pick a role and sign in/register.
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToRoles = () => {
    if (location.pathname === "/") {
      document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "roles" } });
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <Logo size={30} />
        </Link>

        <div className="nav-right">
          <button type="button" className="btn btn-primary btn-sm" onClick={goToRoles}>
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
