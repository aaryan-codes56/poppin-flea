import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

export default function Terms() {
    return (
        <>
            <Head>
                <title>Terms & Conditions - Poppin</title>
                <meta name="description" content="Terms and Conditions for Poppin Table Reservations" />
            </Head>

            <Navbar />

            <main style={{ padding: '2rem 0', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.3 }}>
                        Poppin Table Reservation
                        <br />
                        <span style={{ color: 'var(--primary-yellow)' }}>Terms & Conditions</span>
                    </h1>

                    <div style={{ background: 'white', padding: 'clamp(1rem, 4vw, 2rem)', borderRadius: '1rem', boxShadow: 'var(--shadow-lg)' }}>
                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>1. Table Confirmation</h2>
                            <p style={{ color: '#6b7280' }}>Your table is confirmed only after successful payment.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>2. Voucher Collection</h2>
                            <p style={{ color: '#6b7280' }}>The amount paid during reservation will be reimbursed in your final bill. Please collect your voucher from the Reception at the entry gate upon arrival.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>3. Table Duration</h2>
                            <p style={{ color: '#6b7280' }}>Each table is reserved for 45 minutes. A 15-minute buffer is provided for arrival delays. Extra time cannot be guaranteed during peak hours.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>4. Late Arrival</h2>
                            <p style={{ color: '#6b7280' }}>If you arrive after the 15-minute buffer, the table may be released to the next guest without refund.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>5. Crowd & Seating Policy</h2>
                            <p style={{ color: '#6b7280' }}>Poppin is a high-footfall event. Standing for long durations near tables or blocking walkways is not allowed.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>6. Behaviour & Conduct</h2>
                            <p style={{ color: '#6b7280' }}>Guests are expected to maintain respectful behaviour toward crew, vendors, and fellow guests. Poppin reserves the right to refuse service in case of misbehaviour.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>7. Non-Transferable</h2>
                            <p style={{ color: '#6b7280' }}>Table reservations and vouchers are non-transferable and must be used on the same day.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>8. Event Conditions</h2>
                            <p style={{ color: '#6b7280' }}>Entry, seating, and table allocation are subject to crowd flow and safety protocols.</p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>9. No Cash Refunds</h2>
                            <p style={{ color: '#6b7280' }}>Reservation amounts are not refundable in cash and can only be adjusted against the final bill.</p>
                        </section>

                        <section style={{ marginBottom: '0' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#374151' }}>10. Management Rights</h2>
                            <p style={{ color: '#6b7280' }}>Poppin management reserves the right to make final decisions in the interest of safety and smooth operations.</p>
                        </section>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link href="/book" className="btn-primary">
                            Book a Table
                        </Link>
                    </div>
                </div>
            </main>

            <footer className={styles.footer}>
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Poppin. All rights reserved.</p>
                    <Link href="/terms" style={{ color: '#6b7280', textDecoration: 'underline', fontSize: '0.9rem' }}>
                        Terms & Conditions
                    </Link>
                </div>
            </footer>
        </>
    );
}
