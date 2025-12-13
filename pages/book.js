import { useState, useEffect } from 'react';
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

    const [paymentData, setPaymentData] = useState({
        transactionId: '',
        upiName: '',
        screenshot: null,
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [availability, setAvailability] = useState({});
    const [loadingSlots, setLoadingSlots] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'screenshot') {
            setPaymentData((prev) => ({ ...prev, screenshot: files[0] }));
        } else {
            setPaymentData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Fetch slots when date changes
    useEffect(() => {
        if (formData.date) {
            fetchSlots(formData.date);
        }
    }, [formData.date]);

    const fetchSlots = async (date) => {
        setLoadingSlots(true);
        try {
            const res = await fetch(`/api/getSlots?date=${date}`);
            const data = await res.json();
            setAvailability(data.availability || {});
        } catch (error) {
            console.error('Failed to fetch slots', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleInitialSubmit = (e) => {
        e.preventDefault();

        // Date validation
        const allowedDates = ['2025-12-24', '2025-12-25', '2025-12-26'];
        if (!allowedDates.includes(formData.date)) {
            setStatus('error');
            setMessage('Please select a valid date: Dec 24, 25, or 26.');
            return;
        }

        // Check if selected slot is full
        const slotStatus = availability[formData.timeSlot]?.[formData.area]?.status;
        if (slotStatus === 'red') {
            setStatus('error');
            setMessage('Selected time slot is full for this area. Please choose another.');
            return;
        }

        setShowPaymentModal(true);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        const data = new FormData();
        // Append form data
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        // Append payment data
        data.append('transactionId', paymentData.transactionId);
        data.append('upiName', paymentData.upiName);
        if (paymentData.screenshot) {
            data.append('screenshot', paymentData.screenshot);
        }

        try {
            const response = await fetch('/api/createBooking', {
                method: 'POST',
                body: data, // fetch automatically sets Content-Type to multipart/form-data
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Booking Request Received! We will verify your payment and confirm via email shortly.');
                setShowPaymentModal(false);
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
                setPaymentData({
                    transactionId: '',
                    upiName: '',
                    screenshot: null,
                });
            } else {
                setStatus('error');
                setMessage(result.message || 'Something went wrong. Please try again.');
                setShowPaymentModal(false);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to submit booking. Please check your connection.');
            setShowPaymentModal(false);
        }
    };

    const timeSlots = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

    const totalPrice = (parseInt(formData.adults || 0) + parseInt(formData.children || 0)) * 1000;

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
                                <h2>🎉 Request Received!</h2>
                                <p>{message}</p>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                                    Please check your email for the "Pending Verification" status.
                                    Once we verify your payment (approx 12-15 hrs), you'll get a confirmation email.
                                </p>
                                <button onClick={() => setStatus('idle')} className="btn-primary" style={{ marginTop: '1rem' }}>Book Another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleInitialSubmit} className={styles.form}>
                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="name">Full Name</label>
                                        <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Krish Prakash" />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="phone">Phone Number</label>
                                        <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 12345 67890" />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} placeholder="krish@example.com" />
                                </div>

                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="date">Date</label>
                                        <select id="date" name="date" required value={formData.date} onChange={handleChange}>
                                            <option value="">Select a date</option>
                                            <option value="2025-12-24">Dec 24 (Wed) - Christmas Eve</option>
                                            <option value="2025-12-25">Dec 25 (Thu) - Christmas Day</option>
                                            <option value="2025-12-26">Dec 26 (Fri) - Post Christmas</option>
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="area">Select Area</label>
                                        <select id="area" name="area" value={formData.area} onChange={handleChange}>
                                            <option value="Library (Smoking)">Library (Smoking)</option>
                                            <option value="Indoor">Indoor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>Time Slot <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>(45 mins per slot)</span></label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {timeSlots.map(slot => {
                                            const slotInfo = availability[slot]?.[formData.area];
                                            const statusColor = slotInfo?.status || 'green'; // default green if not fetched yet
                                            const isFull = statusColor === 'red';

                                            let borderColor = '#22c55e'; // green
                                            if (statusColor === 'yellow') borderColor = '#eab308';
                                            if (statusColor === 'red') borderColor = '#ef4444';

                                            return (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    disabled={isFull}
                                                    onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                                                    style={{
                                                        padding: '0.5rem',
                                                        border: `2px solid ${borderColor}`,
                                                        backgroundColor: formData.timeSlot === slot ? borderColor : 'white',
                                                        color: formData.timeSlot === slot ? 'white' : 'black',
                                                        borderRadius: '8px',
                                                        cursor: isFull ? 'not-allowed' : 'pointer',
                                                        opacity: isFull ? 0.6 : 1,
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                        <span style={{ color: '#22c55e' }}>●</span> Available &nbsp;
                                        <span style={{ color: '#eab308' }}>●</span> Filling Fast &nbsp;
                                        <span style={{ color: '#ef4444' }}>●</span> Full
                                    </p>
                                </div>

                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="adults">Adults</label>
                                        <input type="number" id="adults" name="adults" min="1" required value={formData.adults} onChange={handleChange} />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="children">Children</label>
                                        <input type="number" id="children" name="children" min="0" required value={formData.children} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="comments">Special Requests</label>
                                    <textarea id="comments" name="comments" rows="3" value={formData.comments} onChange={handleChange} placeholder="Any special requests?" style={{ padding: '0.75rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical' }} />
                                </div>

                                {status === 'error' && <p className={styles.error}>{message}</p>}

                                <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
                                    Proceed to Payment
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: '500px', width: '90%',
                            maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>

                            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Scan to Pay</h2>

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <img
                                    src="/payment-qr.png"
                                    alt="Payment QR Code"
                                    style={{ width: '250px', height: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}
                                />
                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Scan with any UPI App</p>
                                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>Total Amount: Rs. {totalPrice}</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>({formData.adults} Adults + {formData.children} Children) x Rs. 1000</p>
                                </div>
                            </div>

                            <form onSubmit={handleFinalSubmit}>
                                <div className={styles.field} style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="transactionId">Transaction ID / UTR</label>
                                    <input
                                        type="text"
                                        id="transactionId"
                                        name="transactionId"
                                        required
                                        value={paymentData.transactionId}
                                        onChange={handlePaymentChange}
                                        placeholder="e.g. 123456789012"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div className={styles.field} style={{ marginBottom: '1rem' }}>
                                    <label htmlFor="upiName">Name on UPI</label>
                                    <input
                                        type="text"
                                        id="upiName"
                                        name="upiName"
                                        required
                                        value={paymentData.upiName}
                                        onChange={handlePaymentChange}
                                        placeholder="e.g. Krish Prakash"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div className={styles.field} style={{ marginBottom: '1.5rem' }}>
                                    <label htmlFor="screenshot">Payment Screenshot <span style={{ color: '#dc2626' }}>*</span></label>
                                    <input
                                        type="file"
                                        id="screenshot"
                                        name="screenshot"
                                        accept="image/*"
                                        required
                                        onChange={handlePaymentChange}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }}>Required for payment verification</p>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <span style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid #000',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}></span>
                                            Uploading & Submitting...
                                        </>
                                    ) : 'Confirm Booking'}
                                </button>
                                <style jsx>{`
                                    @keyframes spin {
                                        to { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
