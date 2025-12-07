import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>PoppinFlea - Book Your Table</title>
        <meta name="description" content="Reserve your stall at the most exciting flea market experience." />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.title}>Book Your Table at <span className={styles.highlight}>PoppinFlea</span></h1>
            <p className={styles.subtitle}>Reserve your stall or booth instantly. Join the most vibrant flea market in town!</p>
            <Link href="/book" className="btn-primary">
              Book a Table →
            </Link>
          </div>
        </section>

        {/* About Section */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>About the Flea Market</h2>
            <div className={styles.grid}>
              <div className="card">
                <h3>Vibrant Community</h3>
                <p>Connect with hundreds of local vendors and thousands of shoppers.</p>
              </div>
              <div className="card">
                <h3>Prime Location</h3>
                <p>Located in the heart of the city with easy access and parking.</p>
              </div>
              <div className="card">
                <h3>Premium Setup</h3>
                <p>We provide tables, chairs, and electricity. Just bring your products!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Event Dates */}
        <section className={`${styles.section} ${styles.bgGray}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            <div className={styles.eventCard}>
              <div className={styles.date}>
                <span className={styles.day}>24</span>
                <span className={styles.month}>DEC</span>
              </div>
              <div className={styles.details}>
                <h3>Christmas Eve Special</h3>
                <p>Cafe The Cartel, Vidyapati Marg, Patna</p>
                <p className={styles.smallText}>Near City Center Mall, 4:00 PM - 9:00 PM</p>
                <Link href="/book" className={styles.link}>Book Now</Link>
              </div>
            </div>
            <div className={styles.eventCard}>
              <div className={styles.date}>
                <span className={styles.day}>25</span>
                <span className={styles.month}>DEC</span>
              </div>
              <div className={styles.details}>
                <h3>Christmas Day Bash</h3>
                <p>Cafe The Cartel, Vidyapati Marg, Patna</p>
                <p className={styles.smallText}>Near City Center Mall, 4:00 PM - 9:00 PM</p>
                <Link href="/book" className={styles.link}>Book Now</Link>
              </div>
            </div>
            <div className={styles.eventCard}>
              <div className={styles.date}>
                <span className={styles.day}>26</span>
                <span className={styles.month}>DEC</span>
              </div>
              <div className={styles.details}>
                <h3>Boxing Day Market</h3>
                <p>Cafe The Cartel, Vidyapati Marg, Patna</p>
                <p className={styles.smallText}>Near City Center Mall, 4:00 PM - 9:00 PM</p>
                <Link href="/book" className={styles.link}>Book Now</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} PoppinFlea. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
