import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import React from "react";
import { ThemeSwitcher } from "../ThemeToggle";

export function Footer() {
  return (
    <footer className="py-12 mt-10 max-w-5xl mx-auto">
      <div className="text-muted-foreground">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-xl font-semibold">Lumora </span>
            </div>
            <p className="mb-4">
              AI-powered video editing that turns your content into viral reels.
            </p>
            <div className="flex space-x-4 text-muted-foreground">
              <a href="#" className="hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="">
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Press
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  AI Editing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Auto Captions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Social Uploads
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="inline-block mt-4">
          <ThemeSwitcher />
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
          <p>© {new Date().getFullYear()} Lumora . All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
