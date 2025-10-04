'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ContactFormData } from '@/types';
import './contact.css';

export default function ContactPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (isAuthenticated() && user) {
      const nameParts = user.username.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts[1] || '',
        email: user.email || prev.email
      }));
    }
  }, [user, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formDataToSend = new FormData(form);
    
    if (isAuthenticated() && user) {
      formDataToSend.append('userStatus', 'logged-in');
      formDataToSend.append('username', user.username);
    } else {
      formDataToSend.append('userStatus', 'guest');
    }
    
    fetch("https://getform.io/f/c8bc4018-ec0f-41f6-9cde-1d8d84f60b56", {
      method: "POST",
      body: formDataToSend,
    })
      .then(response => {
        if (response.ok) {
          form.reset();
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            subject: '',
            message: ''
          });
          alert("Message sent successfully!");
        } else {
          alert("Something went wrong. Please try again.");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      });
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">Send me a message</h2>
          {isAuthenticated() && user && (
            <div className="user-greeting">
              <p>👋 Hello, <strong>{user.username}</strong>! We&apos;re here to help.</p>
            </div>
          )}
        </div>
        
        <form 
          className="contact-form" 
          onSubmit={handleSubmit} 
          method="post" 
          action="https://getform.io/f/c8bc4018-ec0f-41f6-9cde-1d8d84f60b56"
        >
          <div className="contact-form__name-row">
            <div className="contact-form__field-group">
              <label htmlFor="firstName" className="contact-form__label">First Name</label>
              <input 
                type="text" 
                id="firstName"
                name="firstName" 
                className="contact-form__input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="contact-form__field-group">
              <label htmlFor="lastName" className="contact-form__label">Last Name</label>
              <input 
                type="text" 
                id="lastName"
                name="lastName" 
                className="contact-form__input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="contact-form__field-group">
            <label htmlFor="email" className="contact-form__label">Email</label>
            <input 
              type="email" 
              id="email"
              name="email" 
              className="contact-form__input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="contact-form__field-group">
            <label htmlFor="subject" className="contact-form__label">Subject</label>
            <select 
              id="subject"
              name="subject" 
              className="contact-form__select"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a topic</option>
              <option value="general">General Inquiry</option>
              <option value="support">Technical Support</option>
              <option value="billing">Billing Question</option>
              <option value="feedback">Feedback</option>
              {isAuthenticated() && (
                <>
                  <option value="account">Account Issue</option>
                  <option value="feature">Feature Request</option>
                </>
              )}
            </select>
          </div>
          
          <div className="contact-form__field-group">
            <label htmlFor="message" className="contact-form__label">Message:</label>
            <textarea 
              id="message"
              name="message" 
              rows={6}
              className="contact-form__textarea"
              value={formData.message}
              onChange={handleChange}
              placeholder={
                isAuthenticated() 
                  ? "Tell us how we can help you with your music learning journey..."
                  : "Tell us how we can help you..."
              }
              required
            ></textarea>
          </div>
          
          <button type="submit" className="contact-form__submit-btn">Send Message</button>
        </form>
        
        <div className="faq-section">
          <h3 className="faq-section__title">Frequently Asked Questions</h3>
          
          <div className="faq-item">
            <details className="faq-item__details">
              <summary className="faq-item__question">How do I reset my password?</summary>
              <p className="faq-item__answer">
                To reset your password, click on the &quot;Forgot Password&quot; link on the login page. 
                You&apos;ll receive an email with instructions to create a new password.
              </p>
            </details>
          </div>
          
          <div className="faq-item">
            <details className="faq-item__details">
              <summary className="faq-item__question">How can I access premium features?</summary>
              <p className="faq-item__answer">
                {isAuthenticated() 
                  ? "As a logged-in user, you already have access to many features! Premium features will be available soon."
                  : "Sign up for an account to access advanced music theory tools and discussion features. Premium features are coming soon!"
                }
              </p>
            </details>
          </div>
          
          <div className="faq-item">
            <details className="faq-item__details">
              <summary className="faq-item__question">What are your support hours?</summary>
              <p className="faq-item__answer">
                Our support team is available Monday through Friday from 9am to 6pm EST.
                For urgent issues outside of business hours, please use our emergency contact form.
              </p>
            </details>
          </div>
          
          {!isAuthenticated() && (
            <div className="faq-item">
              <details className="faq-item__details">
                <summary className="faq-item__question">Do I need an account to use the site?</summary>
                <p className="faq-item__answer">
                  While you can browse some content as a guest, creating an account unlocks full access to 
                  our music theory lessons, discussion forums, and personalized learning features.
                </p>
              </details>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}