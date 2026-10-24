import Image from "next/image";
import heroImage from '../assets/GDPTalks.png';

/** Stack of problem-statement sheets. Counts and titles come from the content data, never invented. */
export default function HeroAsset() {
  return (
    <div className="mt-5 hidden lg:block">
      <div className="relative h-80">
        <div
            className="bob absolute px-4 py-2.5"
          >
            <Image
              src={heroImage}
              alt="GDP Talks 2026 illustration featuring creative building blocks and people collaborating"
              className="relative z-10 w-full max-w-[780px] object-contain drop-shadow-sm"
              sizes="(max-width: 1024px) 100vw, 780px"
              priority
            />
          </div>
      </div>
    </div>
  );
}
