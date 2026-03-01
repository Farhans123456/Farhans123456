import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { supabase } from '../lib/supabase';

const BookingForm = () => {
    const { isBookingOpen, setIsBookingOpen } = usePortfolio();

    // Form stages: 0 = User Details, 1 = OTP Verification, 2 = Success
    const [stage, setStage] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']); // 8-digit for Supabase
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isBookingOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return; // Only allow 1 char per box
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance to next input
        if (value !== '' && index < 7) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Handle backspace navigation
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim().slice(0, 8);

        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);

            // Advance focus to the correct input after pasting
            const nextFocusIndex = Math.min(pastedData.length, 7);
            document.getElementById(`otp-${nextFocusIndex}`).focus();
        }
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        const { error } = await supabase.auth.signInWithOtp({
            email: formData.email,
            options: {
                shouldCreateUser: true
            }
        });

        setIsLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            setStage(1); // Move to OTP
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const enteredOtp = otp.join('');
        if (enteredOtp.length === 8) {
            setIsLoading(true);
            setErrorMsg('');

            const { data, error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: enteredOtp,
                type: 'email'
            });

            if (error) {
                setErrorMsg(error.message);
                setIsLoading(false);
                return;
            }

            // If auth successful, insert appointment
            if (data?.user) {
                const { error: dbError } = await supabase
                    .from('appointments')
                    .insert([
                        {
                            first_name: formData.firstName,
                            middle_name: formData.middleName,
                            last_name: formData.lastName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address
                        }
                    ]);

                if (dbError) {
                    setErrorMsg("Error saving appointment: " + dbError.message);
                    setIsLoading(false);
                    return;
                }

                // Temporary specific booking, log them out
                await supabase.auth.signOut();

                setIsLoading(false);
                setStage(2); // Move to Success
                // Auto close after 3 seconds
                setTimeout(() => {
                    closeModal();
                }, 3000);
            }
        } else {
            setErrorMsg("Please enter a valid 8-digit code.");
        }
    };

    const closeModal = () => {
        setIsBookingOpen(false);
        // Reset state after closing animation would finish
        setTimeout(() => {
            setStage(0);
            setFormData({ firstName: '', middleName: '', lastName: '', email: '', phone: '', address: '' });
            setOtp(['', '', '', '', '', '', '', '']);
            setErrorMsg('');
        }, 500);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 5, 10, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <style>
                {`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .booking-input {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-family: 'Space Grotesk', sans-serif;
                    transition: all 0.3s ease;
                    outline: none;
                }
                .booking-input:focus {
                    border-color: #00f3ff;
                    background: rgba(0, 243, 255, 0.05);
                    box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
                }
                .booking-label {
                    display: block;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 0.4rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .booking-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #00f3ff 0%, #a200ff 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 1.5rem;
                }
                .booking-btn:hover {
                    box-shadow: 0 0 25px rgba(0, 243, 255, 0.4);
                    transform: translateY(-2px);
                }
                .close-btn {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: color 0.3s;
                }
                .close-btn:hover { color: white; }
                `}
            </style>

            <div style={{
                position: 'relative',
                background: 'rgba(15, 15, 25, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '3rem',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 243, 255, 0.1)',
                animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <button className="close-btn" onClick={closeModal}>✕</button>

                {stage === 0 && (
                    <form onSubmit={handleDetailsSubmit}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.5rem' }}>Secure Appointment</h2>
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Enter your details to initiate an encrypted link.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                            <div>
                                <label className="booking-label">First Name</label>
                                <input required className="booking-input" name="firstName" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="booking-label">Middle Name</label>
                                <input className="booking-input" name="middleName" value={formData.middleName} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="booking-label">Last Name</label>
                                <input required className="booking-input" name="lastName" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                            <div>
                                <label className="booking-label">Email</label>
                                <input required type="email" className="booking-input" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="booking-label">Phone</label>
                                <input required type="tel" className="booking-input" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label className="booking-label">Address</label>
                            <input required className="booking-input" name="address" value={formData.address} onChange={handleChange} />
                        </div>

                        <button type="submit" className="booking-btn" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Initialize Connection →'}
                        </button>
                        {errorMsg && <p style={{ color: '#ff4444', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{errorMsg}</p>}
                    </form>
                )}

                {stage === 1 && (
                    <form onSubmit={handleOtpSubmit} style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                        <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1rem' }}>Identity Verification</h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2.5rem' }}>
                            A secure 8-digit token has been routed to <strong>{formData.email}</strong>.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={handleOtpPaste}
                                    style={{
                                        width: '45px',
                                        height: '60px',
                                        fontSize: '1.8rem',
                                        textAlign: 'center',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${digit ? '#00f3ff' : 'rgba(255, 255, 255, 0.2)'}`,
                                        borderRadius: '12px',
                                        color: 'white',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        boxShadow: digit ? '0 0 15px rgba(0, 243, 255, 0.2)' : 'none'
                                    }}
                                />
                            ))}
                        </div>

                        <button type="submit" className="booking-btn" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify Signal'}
                        </button>
                        {errorMsg && <p style={{ color: '#ff4444', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{errorMsg}</p>}
                    </form>
                )}

                {stage === 2 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{
                            width: '80px', height: '80px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '2px solid #10b981',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#10b981',
                            fontSize: '2rem',
                            boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
                        }}
                        >
                            ✓
                        </div>
                        <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>Connection Secured</h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Your appointment data has been securely transmitted. Awaiting further synchronization.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingForm;
