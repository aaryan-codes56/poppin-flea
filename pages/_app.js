import { Fraunces, Manrope } from 'next/font/google';
import '@/styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          --font-fraunces: ${fraunces.style.fontFamily};
          --font-manrope: ${manrope.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
