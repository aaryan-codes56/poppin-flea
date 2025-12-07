import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/Admin.module.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple mock authentication for MVP
        if (email === 'admin@poppinflea.com' && password === 'admin123') {
            localStorage.setItem('isAdmin', 'true');
            router.push('/admin');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <Head>
                <title>Admin Login - PoppinFlea</title>
            </Head>
            <div className={styles.loginCard}>
                <h1>Admin Login</h1>
                <form onSubmit={handleLogin} className={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <button type="submit" className="btn-primary">Login</button>
                </form>
            </div>
        </div>
    );
}
