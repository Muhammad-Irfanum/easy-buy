"use client";

import { useState, useEffect } from "react";

import NavbarBrand from "./NavbarBrand";
import NavbarSearch from "./NavbarSearch";
import NavbarActions from "./NavbarActions";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { FiMenu, FiX } from "react-icons/fi";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 px-40 w-full z-50 transition-all duration-300 
        ${
          isScrolled
            ? "bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800/30"
            : "bg-white dark:bg-gray-900 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800"
        }
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <NavbarBrand />

          <NavbarMobileToggle isOpen={isOpen} setIsOpen={setIsOpen} />

          <NavbarSearch className="hidden md:flex flex-1 max-w-xl mx-4" />

          <NavbarActions className="hidden md:flex" />
        </div>

        <NavbarMobileMenu isOpen={isOpen} />
      </div>
    </nav>
  );
}

interface MobileToggleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function NavbarMobileToggle({ isOpen, setIsOpen }: MobileToggleProps) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
    </button>
  );
}
