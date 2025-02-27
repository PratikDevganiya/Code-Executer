import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react"; // For icons

const Navbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#2D2D2D] shadow-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-3xl font-bold text-[#FFDEAD] font-['Righteous'] tracking-wider">
                Code
              </span>
              <span className="text-3xl font-bold text-white font-['Righteous'] tracking-wider">
                Boost
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-x-8">
            {/* Code Editor Link */}
            <Link
              to="/editor"
              className="text-white text-lg font-['Quicksand'] tracking-wide 
                 hover:text-[#FFDEAD] transition duration-300 relative group"
            >
              CodeEditor
              {/* Underline Effect */}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#FFDEAD] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* If user is logged in, show Profile instead of Sign In */}
            {user ? (
              <Link
                to="/profile"
                className="text-white text-lg font-['Quicksand'] tracking-wide 
                 hover:text-[#FFDEAD] transition duration-300 relative group"
              >
                Profile
                {/* Underline Effect */}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#FFDEAD] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-white text-lg font-['Quicksand'] tracking-wide 
                 hover:text-[#FFDEAD] transition duration-300 relative group"
              >
                Sign In
                {/* Underline Effect */}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#FFDEAD] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-[#2D2D2D] py-4 space-y-3">
            <Link
              to="/editor"
              className="block text-white text-center hover:text-[#FFDEAD]"
              onClick={() => setIsOpen(false)}
            >
              Codeditor
            </Link>
            {user ? (
              <Link
                to="/profile"
                className="block text-white text-center hover:text-[#FFDEAD]"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            ) : (
              <Link
                to="/login"
                className="block text-white text-center hover:text-[#FFDEAD]"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
