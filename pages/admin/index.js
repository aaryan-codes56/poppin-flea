import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            router.push('/admin/login');
        } else {
            fetchBookings();
        }
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/getBookings');
            const data = await res.json();
            setBookings(data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (rowIndex) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await fetch('/api/cancelBooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rowIndex }),
            });

            if (response.ok) {
                alert('Booking cancelled successfully');
                // Refresh bookings
                fetchBookings();
            } else {
                alert('Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Error cancelling booking');
        }
    };

    const stats = {
        total: bookings.length,
        reserved: bookings.filter(b => b.status === 'Reserved').length,
        completed: bookings.filter(b => b.status === 'Completed').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    };

    return (
        <>
            <Head>
                <title>Admin Dashboard - PoppinFlea</title>
            </Head>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <h1 className={styles.title}>Dashboard</h1>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>Total Bookings</h3>
                            <p>{stats.total}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Reserved</h3>
                            <p>{stats.reserved}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Cancelled</h3>
                            <p>{stats.cancelled}</p>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        {loading ? (
                            <p>Loading bookings...</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Area</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Adults</th>
                                        <th>Children</th>
                                        <th>Comments</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => (
                                        <tr key={index}>
                                            <td>{booking.name}</td>
                                            <td>{booking.phone}</td>
                                            <td>{booking.area}</td>
                                            <td>{booking.date}</td>
                                            <td>{booking.timeSlot}</td>
                                            <td>{booking.adults}</td>
                                            <td>{booking.children}</td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.comments}>{booking.comments}</td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[booking.status.toLowerCase()]}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>
                                                {booking.status !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="10" style={{ textAlign: 'center' }}>No bookings found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
