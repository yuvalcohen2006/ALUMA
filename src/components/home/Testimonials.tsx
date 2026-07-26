import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import TestimonialsColumn from "@/components/ui/testimonials-column";
import { testimonials } from "@/data/testimonials";

// NOTE: `testimonials` is placeholder/demo content — see the banner in
// src/data/testimonials.ts before this section is made public.
const firstColumn = testimonials.slice(0, 4);
const secondColumn = testimonials.slice(4, 8);
const thirdColumn = testimonials.slice(8, 12);

// Warm-white break between the charcoal materials rail and the sand club card.
const Testimonials = () => {
  return (
    <section dir="rtl" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container-luxury">
        <Reveal className="mb-10 md:mb-14 flex flex-col items-center">
          <SectionHeading>לקוחות מספרים</SectionHeading>
          <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />
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
