import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { CONTACT } from '@/lib/config/site';
import p from '@/styles/pages.module.css';

const UPDATED = '10 November 2026';

export default function Privacy() {
  return (
    <Layout seo={{ title: 'Privacy policy', description: 'How Poppin collects, uses and protects your information.' }}>
      <PageHeader eyebrow="Legal" title="Privacy policy" intro={`Last updated ${UPDATED}.`} />
      <section className="section bg-cream">
        <div className={`container-narrow ${p.legal}`}>
          <p>
            This policy explains what information Poppin (“we”, “us”) collects through poppinflea.in and how we use it. We keep it short and only
            collect what we need to run our events.
          </p>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Stall enquiries:</strong> brand name, contact name, phone, email, Instagram handle, business category, product description,
              stall preference, any requirements you share, and which page or campaign brought you to the form.
            </li>
            <li>
              <strong>Bookings (when open):</strong> the details you enter on a booking form, such as name, phone, email, date and any payment
              reference you provide.
            </li>
            <li>
              <strong>Event updates:</strong> your email address (and name if given) when you subscribe.
            </li>
            <li>
              <strong>Analytics:</strong> if enabled, we use cookieless, privacy-friendly analytics that count page views and button clicks without
              identifying you. We do not use advertising cookies.
            </li>
          </ul>
          <h2>How we use it</h2>
          <ul>
            <li>To respond to your enquiry, manage stall applications and confirm bookings.</li>
            <li>To send confirmation emails and, if you subscribed, event updates.</li>
            <li>To understand which channels bring people to the site so we can improve our events.</li>
          </ul>
          <p>We never sell your information. We don’t share it with third parties except the services we use to run the site (below).</p>
          <h2>Where it’s stored</h2>
          <p>
            Records are stored in a private Google Sheets workspace accessible only to the Poppin team. Emails are sent with Google (Gmail).
            Payment screenshots (when bookings require them) are stored with Cloudinary. The site runs on a cloud hosting provider.
          </p>
          <h2>Instagram content</h2>
          <p>
            Some pages show posts and reels embedded from Instagram. These are loaded from Instagram (Meta) only when you scroll to them, and
            Instagram may set its own cookies under its own privacy policy.
          </p>
          <h2>How long we keep it</h2>
          <p>
            We keep enquiry and booking records only as long as needed to run the related event, handle follow-ups and keep basic records,
            unless you ask us to delete them sooner.
          </p>
          <h2>Your choices</h2>
          <ul>
            <li>Unsubscribe from updates any time using the link in any email.</li>
            <li>
              Ask us to see, correct or delete your information: call or WhatsApp {CONTACT.phone} or DM {CONTACT.instagramHandle}.
            </li>
          </ul>
          <h2>Changes</h2>
          <p>If we change this policy we’ll update the date at the top of this page.</p>
        </div>
      </section>
    </Layout>
  );
}
