import Link from 'next/link';
import { Leaf, Github, Mail, Heart, Users, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white mb-4">
              <Leaf className="h-8 w-8 text-green-400" />
              <span className="font-bold text-xl">HerbalDB</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              HerbalDB adalah database tanaman obat Indonesia dan senyawa bioaktifnya. 
              Misi kami adalah melestarikan dan membagikan pengetahuan tradisional 
              untuk penelitian modern.
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Fork dari proyek HerbalDB oleh Annisa Prida
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Menu</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white text-sm">
                  Cari Database
                </Link>
              </li>
              <li>
                <Link href="/species" className="text-gray-400 hover:text-white text-sm">
                  Daftar Spesies
                </Link>
              </li>
              <li>
                <Link href="/compounds" className="text-gray-400 hover:text-white text-sm">
                  Daftar Senyawa
                </Link>
              </li>
              <li>
                <Link href="/contributors" className="text-gray-400 hover:text-white text-sm">
                  Kontributor
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white text-sm">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Dukung Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:febriandeffan@gmail.com" 
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  febriandeffan@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/deffnotjeff" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  @deffnotjeff
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/deffan10" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  deffan10
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} HerbalDB Indonesia. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
