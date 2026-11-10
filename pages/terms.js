import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { CONTACT } from '@/lib/config/site';
import { TABLE_BOOKING } from '@/lib/config/tableBooking';
import p from '@/styles/pages.module.css';

// Table reservation terms are preserved word for word from the original site.
const TABLE_TERMS = [
  ['Table Confirmation', 'Your table is confirmed only after successful payment.'],
  ['Voucher Collection', 'The amount paid during reservation will be reimbursed in your final bill. Please collect your voucher from the Reception at the entry gate upon arrival.'],
  ['Table Duration', 'Each table is reserved for 45 minutes. A 15-minute buffer is provided for arrival delays. Extra time cannot be guaranteed during peak hours.'],
  ['Late Arrival', 'If you arrive after the 15-minute buffer, the table may be released to the next guest without refund.'],
  ['Crowd & Seating Policy', 'Poppin is a high-footfall event. Standing for long durations near tables or blocking walkways is not allowed.'],
  ['Behaviour & Conduct', 'Guests are expected to maintain respectful behaviour toward crew, vendors, and fellow guests. Poppin reserves the right to refuse service in case of misbehaviour.'],
  ['Non-Transferable', 'Table reservations and vouchers are non-transferable and must be used on the same day.'],
  ['Event Conditions', 'Entry, seating, and table allocation are subject to crowd flow and safety protocols.'],
  ['No Cash Refunds', 'Reservation amounts are not refundable in cash and can only be adjusted against the final bill.'],
  ['Management Rights', 'Poppin management reserves the right to make final decisions in the interest of safety and smooth operations.'],
];

export default function Terms() {
  return (
    <Layout seo={{ title: 'Terms & conditions', description: 'Terms for using the Poppin website, stall enquiries and table reservations.' }}>
      <PageHeader eyebrow="Legal" title="Terms & conditions" />
      <section className="section bg-cream">
        <div className={`container-narrow ${p.legal}`}>
          <h2>Website and stall enquiries</h2>
          <ol>
            <li>Submitting a stall enquiry does not reserve or confirm a stall. A stall is confirmed only when the Poppin team confirms it with you directly.</li>
            <li>Stall pricing, sizes, inclusions, payment and refund terms are shared by the team and apply only once confirmed in writing.</li>
            <li>Poppin may accept or decline any application to keep a balanced, high-quality mix of brands.</li>
            <li>Event details (including venue and timings) may change; official updates are published on this website and on {CONTACT.instagramHandle}.</li>
            <li>Brand names and logos shown belong to their owners and are shown to reflect past participation or partnership.</li>
          </ol>

          {TABLE_BOOKING.enabled && (
            <>
              <h2>Table reservations</h2>
              <ol>
                {TABLE_TERMS.map(([t, d]) => (
                  <li key={t}>
                    <strong>{t}.</strong> {d}
                  </li>
                ))}
              </ol>
            </>
          )}
          <p>Questions? Call or WhatsApp {CONTACT.phone}.</p>
        </div>
      </section>
    </Layout>
  );
}
