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

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        area: 'Indoor',
        date: '2025-12-24',
        timeSlot: '16:00',
        adults: 1,
        children: 0,
        comments: '',
    });

    const handleStatusUpdate = async (rowIndex, status) => {
        if (!confirm(`Mark this booking as ${status}?`)) return;

        try {
            const response = await fetch('/api/updateBookingStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rowIndex, status }),
            });

            if (response.ok) {
                // Refresh bookings
                fetchBookings();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOnSpotSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/createBooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Booking Successful! Ref ID: #${data.data.updates.updatedData.values[0][11] || 'N/A'}`); // Try to get Ref ID if possible, or just success
                setShowForm(false);
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    area: 'Indoor',
                    date: '2025-12-24',
                    timeSlot: '16:00',
                    adults: 1,
                    children: 0,
                    comments: '',
                });
                fetchBookings();
            } else {
                alert(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('An error occurred. Please try again.');
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

                    <div style={{ marginBottom: '2rem' }}>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#000',
                                color: '#FFE103',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}
                        >
                            {showForm ? 'Close Form' : '+ On-Spot Registration'}
                        </button>

                        {showForm && (
                            <form onSubmit={handleOnSpotSubmit} style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required style={{ padding: '0.5rem' }} />
                                <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required style={{ padding: '0.5rem' }} />
                                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required style={{ padding: '0.5rem' }} />
                                <select name="area" value={formData.area} onChange={handleInputChange} style={{ padding: '0.5rem' }}>
                                    <option value="Indoor">Indoor</option>
                                    <option value="Outdoor">Outdoor</option>
                                    <option value="Library (Smoking)">Library (Smoking)</option>
                                </select>
                                <select name="date" value={formData.date} onChange={handleInputChange} style={{ padding: '0.5rem' }}>
                                    <option value="2025-12-24">Dec 24</option>
                                    <option value="2025-12-25">Dec 25</option>
                                    <option value="2025-12-26">Dec 26</option>
                                </select>
                                <select name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} style={{ padding: '0.5rem' }}>
                                    {['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <input type="number" name="adults" placeholder="Adults" min="1" value={formData.adults} onChange={handleInputChange} required style={{ padding: '0.5rem' }} />
                                <input type="number" name="children" placeholder="Children" min="0" value={formData.children} onChange={handleInputChange} style={{ padding: '0.5rem' }} />
                                <input type="text" name="comments" placeholder="Comments" value={formData.comments} onChange={handleInputChange} style={{ padding: '0.5rem' }} />
                                <button type="submit" style={{ gridColumn: '1 / -1', padding: '0.75rem', backgroundColor: '#FFE103', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Book Now</button>
                            </form>
                        )}
                    </div>

                    <div className={styles.tableContainer}>
                        {loading ? (
                            <p>Loading bookings...</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Ref ID</th>
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
                                            <td><strong>#{booking.refId}</strong></td>
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
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {booking.status === 'Reserved' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'Arrived')}
                                                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                            title="Mark as Arrived"
                                                        >
                                                            Arrived
                                                        </button>
                                                    )}
                                                    {booking.status === 'Arrived' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'Completed')}
                                                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                            title="Mark as Completed (Table Empty)"
                                                        >
                                                            Empty
                                                        </button>
                                                    )}
                                                    {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                                                        <button
                                                            onClick={() => handleCancel(booking.id)}
                                                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                                            title="Cancel Booking"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="11" style={{ textAlign: 'center' }}>No bookings found.</td>
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
