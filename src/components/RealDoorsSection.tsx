import { useState } from 'react';
import { NavigationPage } from '../types';

interface RealDoorsSectionProps {
  onOpenDoor: (page: NavigationPage) => void;
}

const DOORS_CONFIG: {
  id: NavigationPage;
  title: string;
  doorColor: string;
  doorDarkColor: string;
  desc: string;
  tags: string[];
}[] = [
  {
    id: 'web-development',
    title: 'Latest Updates',
    doorColor: '#22304a',
    doorDarkColor: '#1c2840',
    desc: 'Bespoke web applications, fintech tools, sub-second latency & clean Next.js/React engineering.',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Node.js'],
  },
  {
    id: 'app-development',
    title: 'Documents Need',
    doorColor: '#4a3540',
    doorDarkColor: '#3f2d37',
    desc: 'Fluid mobile-first experiences, iOS architectures, gesture navigation & offline sync.',
    tags: ['iOS', 'Swift', 'React Native', 'Mobile UX'],
  },
  {
    id: 'ui-ux',
    title: 'Our Services',
    doorColor: '#7a8670',
    doorDarkColor: '#66705d',
    desc: 'Product design, design tokens, wireframing, usability testing & clickable prototypes in Figma.',
    tags: ['Figma', 'Framer', 'Design Systems', 'Prototypes'],
  },
  {
    id: 'graphic-design',
    title: 'Gallery',
    doorColor: '#a4552c',
    doorDarkColor: '#8c4826',
    desc: 'Brand identities, social media carousels, packaging specs & vector illustrations.',
    tags: ['Illustrator', 'Photoshop', 'Branding', 'Typography'],
  },
  {
    id: 'photography',
    title: 'Photographer',
    doorColor: '#423d3d',
    doorDarkColor: '#2b2727',
    desc: 'Architectural geometry, street rhythm, concerts, and natural light with 35mm & 50mm primes.',
    tags: ['Sony Alpha', '35mm Prime', 'EXIF', 'Natural Light'],
  },
];

export default function RealDoorsSection({ onOpenDoor }: RealDoorsSectionProps) {
  const [activeDoor, setActiveDoor] = useState<NavigationPage | null>(null);

  return (
    <section id="works" className="py-28 md:py-36 border-t border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)] bg-[#E8E4E0] dark:bg-[#1A1818] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6">
        {/* Wall Text Header */}
        <div className="mb-14 text-center sm:text-left">
          <h2 className="sr-only">My work, one door per skill</h2>
          <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] leading-tight">
            Magic happens <br className="hidden sm:inline" />behind the doors.
          </p>
          <p className="mt-2 text-xs sm:text-sm font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Swipe along the wall · Click a door to step inside
          </p>
        </div>

        {/* The 5 Doors in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 lg:gap-6 pt-4">
          {DOORS_CONFIG.map((door, idx) => {
            const isOpen = activeDoor === door.id;

            return (
              <div
                key={door.id}
                onMouseEnter={() => setActiveDoor(door.id)}
                onMouseLeave={() => setActiveDoor(null)}
                onClick={() => onOpenDoor(door.id)}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* 3D Doorway Unit */}
                <div
                  className="door-scene relative w-full h-[360px] sm:h-[400px] rounded-t-2xl rounded-b-md p-2 bg-[#DED8D4] dark:bg-[#252121] border-t-4 border-x-4 border-b-8 border-[#C4B0B0]/40 dark:border-black/50 shadow-xl overflow-hidden flex flex-col justify-end"
                >
                  {/* Interior Room Light Spill behind the door */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-amber-100 via-amber-50 to-white dark:from-amber-200/90 dark:via-neutral-100 dark:to-amber-50 flex flex-col items-center justify-center p-4 text-center transition-opacity duration-500"
                    style={{
                      opacity: isOpen ? 1 : 0.15,
                    }}
                  >
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 mb-1">
                      DOOR 0{idx + 1}
                    </div>
                    <div className="text-sm font-display font-bold text-neutral-950 mb-2">
                      {door.title}
                    </div>
                    <p className="text-[11px] text-neutral-600 line-clamp-3 leading-snug">
                      {door.desc}
                    </p>
                    <span className="mt-4 px-3 py-1 text-[11px] font-semibold text-white bg-neutral-900 rounded-full shadow-xs">
                      Enter Room →
                    </span>
                  </div>

                  {/* The Swinging 3D Door Leaf */}
                  <div
                    className="door-panel relative w-full h-full rounded-t-xl rounded-b-xs border-r-2 border-black/30 shadow-2xl flex flex-col justify-between p-4"
                    style={{
                      backgroundColor: door.doorColor,
                    }}
                  >
                    {/* Top Molded Flute Panels */}
                    <div className="w-full h-24 rounded-lg border border-black/20 bg-black/10 shadow-inner flex items-center justify-center">
                      <div className="w-4/5 h-16 rounded-md border border-white/10 bg-white/5" />
                    </div>

                    {/* Engraved Brass Plate */}
                    <div className="my-auto mx-auto px-4 py-1.5 rounded-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] border border-amber-900/60 shadow-md">
                      <span className="text-[11px] font-display font-bold tracking-wider uppercase text-neutral-950">
                        {door.title}
                      </span>
                    </div>

                    {/* Brass Lever Handle and Keyhole Lock */}
                    <div className="relative self-end my-auto right-1 flex flex-col items-center gap-1">
                      {/* Lever */}
                      <div className="w-7 h-2 rounded-full bg-gradient-to-r from-[#AA7C11] to-[#F3E5AB] border border-amber-950/60 shadow-sm" />
                      {/* Escutcheon plate & Keyhole */}
                      <div className="w-3.5 h-6 rounded-sm bg-[#D4AF37] border border-amber-950/40 flex items-center justify-center">
                        <div className="w-1 h-2 rounded-full bg-black shadow-inner" />
                      </div>
                    </div>

                    {/* Bottom Molded Flute Panel */}
                    <div className="w-full h-28 rounded-lg border border-black/20 bg-black/10 shadow-inner flex items-center justify-center">
                      <div className="w-4/5 h-20 rounded-md border border-white/10 bg-white/5" />
                    </div>
                  </div>
                </div>

                {/* Door Sill & Light Pool on floor */}
                <div className="w-full flex flex-col items-center mt-1">
                  <div className="w-full h-2 bg-[#B5A8A8] dark:bg-[#141212] rounded-xs shadow-xs" />
                  <div
                    className="w-4/5 h-3 bg-amber-300/30 dark:bg-amber-100/10 rounded-full blur-xs transition-opacity duration-300"
                    style={{ opacity: isOpen ? 1 : 0 }}
                  />
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-2">
                    {door.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
