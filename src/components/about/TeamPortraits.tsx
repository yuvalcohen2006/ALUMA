import alumaLogo from "@/assets/aluma-logo.png";
import storyPortrait from "@/assets/story-portrait.png";
import storyPortraitRoy from "@/assets/story-portrait-roy.png";
import storyPortraitIdan from "@/assets/story-portrait-idan.png";

const people = [
  { src: storyPortraitIdan, alt: "דיוקן קווי, עידן", name: "עידן" },
  { src: storyPortraitRoy, alt: "דיוקן קווי, רועי", name: "רועי" },
  { src: storyPortrait, alt: "דיוקן קווי, בן", name: "בן" },
];

/**
 * The wordmark and the three line portraits, lifted verbatim off the old Our
 * Story page. These two elements were explicitly kept through the rebuild —
 * placement and spacing around them may change, the elements themselves may not.
 *
 * ⚠️ The mask is ONE gradient, 10px deep, along the bottom edge only. An earlier
 * version also intersected a radial and that was what clipped the drawings. Do
 * not reintroduce one. Nothing here crops the image.
 *
 * `mix-blend-multiply` is what drops the portraits' white background onto the
 * page, so this needs a light surface behind it — it will render as grey boxes
 * on charcoal.
 */
const TeamPortraits = ({ showNames = true }: { showNames?: boolean }) => (
  <div className="flex flex-col items-center">
    <img
      src={alumaLogo}
      alt="Aluma"
      className="h-[58px] md:h-[77px] w-auto opacity-90 mb-12 md:mb-[60px]"
    />

    <div
      className="flex items-end justify-center gap-[26px] w-full max-w-[813px] mx-auto"
      style={{
        maskImage: "linear-gradient(to bottom, #000 calc(100% - 10px), transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 calc(100% - 10px), transparent 100%)",
      }}
    >
      {people.map((p) => (
        <img
          key={p.name}
          src={p.src}
          alt={p.alt}
          loading="lazy"
          className="w-1/3 aspect-square object-contain object-bottom mix-blend-multiply"
        />
      ))}
    </div>

    {/* A caption, not names overlaid on the drawings — overlays are fragile at
        every width and the order has to be stated anyway in a right-to-left
        layout. */}
    {showNames && (
      <p className="mt-6 text-[13px] tracking-[0.08em] text-foreground/55">
        מימין לשמאל: {people.map((p) => p.name).join(" · ")}
      </p>
    )}
  </div>
);

export default TeamPortraits;
