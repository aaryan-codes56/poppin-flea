import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
    const router = useRouter();

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logoContainer}>
                    <img src="/logo.png" alt="Poppin Fun & Flea" className={styles.logoImage} />
                </Link>
                <div className={styles.links}>
                    {router.pathname !== '/' && (
                        <Link href="/" className={styles.link}>Home</Link>
                    )}
                    <Link href="/admin/login" className={styles.link}>Admin</Link>
                    <Link href="/book" className="btn-primary">Book a Table</Link>
                </div>
            </div>
        </nav>
    );
}
