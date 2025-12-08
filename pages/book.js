import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import styles from '../styles/Book.module.css';

export default function Book() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        area: 'Library (Smoking)',
        date: '',
        timeSlot: '16:00',
        adults: 1,
        children: 0,
        comments: '',
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        // Date validation
        const allowedDates = ['2025-12-24', '2025-12-25', '2025-12-26'];
        if (!allowedDates.includes(formData.date)) {
            setStatus('error');
            setMessage('Please select a valid date: Dec 24, 25, or 26.');
            return;
        }

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
                setStatus('success');
                setMessage('Your stall has been reserved! We’ll contact you shortly.');
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    area: 'Library (Smoking)',
                    date: '',
                    timeSlot: '16:00',
                    adults: 1,
                    children: 0,
                    comments: '',
                });
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to submit booking. Please check your connection.');
        }
    };

    const timeSlots = [
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00"
    ];

    return (
        <>
            <Head>
                <title>Book a Table - PoppinFlea</title>
            </Head>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.formContainer}>
                        <h1 className={styles.title}>Reserve Your Spot</h1>
                        <p className={styles.subtitle}>Fill in the details below to book your table.</p>

                        {status === 'success' ? (
                            <div className={styles.successMessage}>
                                <h2>🎉 Booking Confirmed!</h2>
                                <p>{message}</p>
                                <button onClick={() => setStatus('idle')} className="btn-primary" style={{ marginTop: '1rem' }}>Book Another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Krish Prakash"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 12345 67890"
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="krish@example.com"
                                    />
                                </div>

                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="area">Select Area</label>
                                        <select
                                            id="area"
                                            name="area"
                                            value={formData.area}
                                            onChange={handleChange}
                                        >
                                            <option value="Library (Smoking)">Library (Smoking)</option>
                                            <option value="Indoor">Indoor</option>
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="timeSlot">Time Slot</label>
                                        <select
                                            id="timeSlot"
                                            name="timeSlot"
                                            value={formData.timeSlot}
                                            onChange={handleChange}
                                        >
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="date">Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            required
                                            min="2025-12-24"
                                            max="2025-12-26"
                                            value={formData.date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        {/* Spacer or additional field if needed */}
                                    </div>
                                </div>

                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="adults">Adults</label>
                                        <input
                                            type="number"
                                            id="adults"
                                            name="adults"
                                            min="1"
                                            required
                                            value={formData.adults}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="children">Children</label>
                                        <input
                                            type="number"
                                            id="children"
                                            name="children"
                                            min="0"
                                            required
                                            value={formData.children}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="comments">Special Requests / Comments</label>
                                    <textarea
                                        id="comments"
                                        name="comments"
                                        rows="3"
                                        value={formData.comments}
                                        onChange={handleChange}
                                        placeholder="Any dietary restrictions or special requests?"
                                        style={{
                                            padding: '0.75rem',
                                            border: '1px solid var(--gray-200)',
                                            borderRadius: 'var(--radius-lg)',
                                            fontFamily: 'inherit',
                                            fontSize: '1rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                {status === 'error' && <p className={styles.error}>{message}</p>}

                                <button
                                    type="submit"
                                    className={`btn-primary ${styles.submitBtn}`}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
