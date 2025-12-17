import Link from 'next/link';
import styles from '../styles/Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <p>&copy; {new Date().getFullYear()} Poppin. All rights reserved.</p>
                    <p style={{ fontSize: '0.95rem' }}>
                        For any queries: <a href="tel:8709294143" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>8709294143</a> / <a href="tel:9334227855" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>9334227855</a>
                    </p>
                    <Link href="/terms" style={{ color: '#6b7280', textDecoration: 'underline', fontSize: '0.9rem' }}>
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </footer>
    );
}
