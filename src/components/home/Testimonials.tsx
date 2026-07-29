import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import TestimonialsColumn from "@/components/ui/testimonials-column";
import { testimonials } from "@/data/testimonials";

const firstColumn = testimonials.slice(0, 4);
const secondColumn = testimonials.slice(4, 8);
const thirdColumn = testimonials.slice(8, 12);

// Warm-white break between the charcoal materials rail and the sand club card.
const Testimonials = () => {
  // ⚠️⚠️ DEV-ONLY SECTION — FABRICATED DEMO CONTENT. ⚠️⚠️
  // src/data/testimonials.ts is invented placeholder copy (see the banner
  // there). Publishing made-up, named customer reviews would be deceptive
  // advertising, so — exactly like the demo catalogue gate in
  // src/hooks/useCollectionsData.ts — this section renders only in dev and
  // returns null in production. Remove this gate ONLY once every customer
  // card holds a real, attributed quote given with the customer's consent.
  if (!import.meta.env.DEV) return null;

  return (
    <section dir="rtl" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container-luxury">
        <Reveal className="mb-16 md:mb-20 flex flex-col items-center">
          <SectionHeading>
            אנשים שכבר חיים
            <br />
            את ה־Outdoor שלהם
          </SectionHeading>
        </Reveal>

        {/* Feather the top and bottom so cards scroll in and out of view softly. */}
        <div className="flex justify-center gap-6 max-h-[560px] md:max-h-[620px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={22} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={28} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={25} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
