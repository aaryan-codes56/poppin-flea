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
            <div className={styles.ctaGroup}>
              <Link href="/book" className="btn-primary">
                Book a Table →
              </Link>
              <a href="https://forms.gle/YOUR_GOOGLE_FORM_ID" target="_blank" rel="noopener noreferrer" className={`${styles.ctaButton} ${styles.secondaryCta}`}>
                Register for Open Mic
              </a>
            </div>
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
                <h3>Post Christmas Fun</h3>
                <p>Cafe The Cartel, Vidyapati Marg, Patna</p>
                <p className={styles.smallText}>Near City Center Mall, 4:00 PM - 9:00 PM</p>
                <Link href="/book" className={styles.link}>Book Now</Link>
              </div>
            </div>
          </div>
        </section>
        {/* Past Events Section */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Past Events</h2>
            <div className={styles.grid}>
              <div className={styles.imageCard}>
                <img src="https://placehold.co/600x400/FFE103/000?text=Past+Event+1" alt="Past Event 1" className={styles.image} />
                <div className={styles.imageOverlay}>
                  <h3>Summer Vibes</h3>
                  <p>June 2025</p>
                </div>
              </div>
              <div className={styles.imageCard}>
                <img src="https://placehold.co/600x400/000/FFE103?text=Past+Event+2" alt="Past Event 2" className={styles.image} />
                <div className={styles.imageOverlay}>
                  <h3>Winter Wonderland</h3>
                  <p>Dec 2024</p>
                </div>
              </div>
              <div className={styles.imageCard}>
                <img src="https://placehold.co/600x400/FFE103/000?text=Past+Event+3" alt="Past Event 3" className={styles.image} />
                <div className={styles.imageOverlay}>
                  <h3>Spring Fling</h3>
                  <p>March 2025</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Venue Details Section */}
        <section className={`${styles.section} ${styles.bgGray}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>The Venue</h2>
            <div className={styles.venueContainer}>
              <div className={styles.venueInfo}>
                <h3>Cafe The Cartel</h3>
                <p className={styles.address}>Vidyapati Marg, beside Vidyapati Bhawan,<br />Lodipur, Patna, Bihar 800001</p>
                <p className={styles.landmark}>Near City Center Mall</p>
                <p className={styles.venueDescription}>
                  Experience the perfect blend of cozy ambiance and vibrant energy.
                  Our venue offers spacious indoor seating, a breezy outdoor area,
                  and a dedicated smoking zone in the library.
                </p>
                <div className={styles.socials}>
                  <p>Follow us on Instagram:</p>
                  <a href="https://instagram.com/poppinflea" target="_blank" rel="noopener noreferrer" className={styles.instaLink}>
                    @poppinflea
                  </a>
                </div>
              </div>
              <div className={styles.venueImageWrapper}>
                <img src="https://placehold.co/800x600/000/FFF?text=Cafe+The+Cartel" alt="Venue" className={styles.venueImage} />
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
