import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import { MouseEventGlow } from "@/components/MouseEventGlow";
import VideoGrid from "@/components/VideoGrid";
import type { ReactNode } from "react";
import { HeroButton } from "@/components/HeroButton";
import Image from "next/image";

interface NavButtonProps {
  href: string;
  filled?: boolean;
  children: ReactNode;
}


const NavButton = ({ href, filled = false, children }: NavButtonProps) => (
  <Link
    href={href}
    className="bg-black no-underline group cursor-pointer relative rounded-full p-px text-sm font-semibold leading-6 text-white inline-block"
  >
    <span className="absolute inset-0 overflow-hidden rounded-full">
      <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.4)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </span>
    <div className="relative flex items-center z-10 rounded-full bg-black py-1.5 px-4 ring-1 ring-white/10">
      {children}
    </div>
    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-purple-600/0 via-purple-600/90 to-purple-600/0 transition-opacity duration-500 group-hover:opacity-40" />
  </Link>
);

const Stars = () => (
  <div className="flex items-center gap-3 mb-8">
    <div className="relative group">
      <Image 
        src="/avatars/mom.jpg" 
        alt="Mom" 
        width={50} 
        height={50} 
        className="rounded-full border-2 border-white/20"
      />
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap border border-white/10 pointer-events-none">
        (not my mom)
      </div>
    </div>
    <div className="flex flex-col">
      <div className="flex">
        {Array(5)
          .fill("★")
          .map((star, i) => (
            <span 
              key={i} 
              className="text-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-transparent bg-clip-text"
            >
              {star}
            </span>
          ))}
      </div>
      <span className="text-gray-400">Loved by my mom</span>
    </div>
  </div>
);

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white font-archivo relative overflow-hidden">
      <MouseEventGlow />
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 relative z-10">
        <div className="flex flex-col p-8 lg:p-16 relative">
          <header className="flex justify-between items-center mb-16">
            <AnimatedLogo />
            <nav className="flex gap-4">
              <NavButton href="/login">
                Login
              </NavButton>
            </nav>
          </header>

          <div className="flex-grow flex flex-col justify-center">
            <h1 className="text-7xl font-bold text-left mb-6 bg-gradient-to-br from-white via-gray-300 to-gray-500 text-transparent bg-clip-text">
              AI Birthday Video Song Generator
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Create and share personalized birthday videos with your friends and family in seconds.
            </p>

            <div className="flex relative">
              <HeroButton href="/login">
                <span>Generate for Free</span>
                <img
                  src="/magic.svg"
                  alt="Magic wand"
                  className="h-7 w-7 brightness-0 invert ml-3 transition-transform duration-300 group-hover:scale-125 group-hover:animate-juggle"
                />
              </HeroButton>
            </div>

            <Stars />
          </div>
        </div>

        <div className="w-full h-[50vh] lg:h-screen">
          <VideoGrid />
        </div>
      </div>
    </main>
  );
}
