import type { NextFont } from 'next/dist/compiled/@next/font';
import localFont from 'next/font/local';
import { Archivo } from 'next/font/google';

export const microgamma = localFont({
  src: '../fonts/MicrogammaDBolExt.woff2',
  variable: '--font-microgamma',
  display: 'swap',
});

export const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
}); 