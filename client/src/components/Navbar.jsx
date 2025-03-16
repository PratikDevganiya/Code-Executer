import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

// Simple CodeBoost Logo Component
const CodeBoostLogo = () => {
  return (
    <div className="flex items-center">
      <span className="text-4xl font-bold text-[#254E58] font-['Righteous'] tracking-wider">
        Code
      </span>
      <span className="text-4xl font-bold text-white font-['Righteous'] tracking-wider">
        Boost
      </span>
    </div>
  );
};

const Navbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Check if the current route is "/login" or "/register"
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <nav className="bg-[#88BDBC] sticky top-0 z-50 border-0">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <CodeBoostLogo />
            </Link>
          </div>

          {/* Desktop Menu - Hide if on Login or Register Page */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center gap-x-8">
              {/* Code Editor Link */}
              <Link
                to="/editor"
                className="relative text-white text-lg font-['Righteous'] tracking-wide 
                   hover:text-[#112D32] transition duration-300 group"
              >
                <span>CodeEditor</span>
                {/* Underline Effect */}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#112D32] transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* If user is logged in, show Profile instead of Sign In */}
              {user ? (
                <Link
                  to="/profile"
                  className="relative text-white text-lg font-['Righteous'] tracking-wide 
                   hover:text-[#112D32] transition duration-300 group"
                >
                  <span>Profile</span>
                  {/* Underline Effect */}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#112D32] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="relative text-white text-lg font-['Righteous'] tracking-wide 
                   hover:text-[#112D32] transition duration-300 group"
                >
                  <span>Sign In</span>
                  {/* Underline Effect */}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#112D32] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {!isAuthPage && (
            <button
              className="md:hidden text-white focus:outline-none hover:text-[#112D32] transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}
        </div>

        {/* Mobile Menu - Hide if on Login or Register Page */}
        {!isAuthPage && isOpen && (
          <div className="md:hidden bg-[#88BDBC] py-4 space-y-3 border-t border-white/20 animate-fadeIn">
            <Link
              to="/editor"
              className="block text-white text-center hover:text-[#112D32] py-2 font-['Righteous'] tracking-wide relative group"
              onClick={() => setIsOpen(false)}
            >
              <span>CodeEditor</span>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-[2px] bg-[#112D32] transition-all duration-300 group-hover:w-2/3"></span>
            </Link>
            
            {user ? (
              <Link
                to="/profile"
                className="block text-white text-center hover:text-[#112D32] py-2 font-['Righteous'] tracking-wide relative group"
                onClick={() => setIsOpen(false)}
              >
                <span>Profile</span>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-[2px] bg-[#112D32] transition-all duration-300 group-hover:w-2/3"></span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="block text-white text-center hover:text-[#112D32] py-2 font-['Righteous'] tracking-wide relative group"
                onClick={() => setIsOpen(false)}
              >
                <span>Sign In</span>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-[2px] bg-[#112D32] transition-all duration-300 group-hover:w-2/3"></span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
