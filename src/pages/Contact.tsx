import Layout from "@/components/Layout";
import Contact from "@/components/Contact";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";

const ContactPage = () => {
  return (
    <Layout>
      <SEO
        title="צרו קשר | Aluma — סלוני חוץ בעיצוב אישי"
        description="ספרו לנו על הפרויקט שלכם — צוות Aluma חוזר אליכם להתאמה אישית מלאה. טלפון 050-451-9062, מייל info@aluma.co.il, אולם תצוגה ביציץ."
        path="/contact"
      />
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="צרו קשר" en="Contact" className="text-xs mb-5" />
          <div className="w-16 h-px bg-primary/30 mx-auto mb-10" />
        </div>
      </section>
      <Contact />
    </Layout>
  );
};

export default ContactPage;
