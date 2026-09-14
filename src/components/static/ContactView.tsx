import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ContactView: React.FC = () => {
  const { websiteContent, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('Showroom Visit');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill out all required inquiry fields.', 'warning');
      return;
    }
    setSubmitted(true);
    showToast('Inquiry received! Our concierge will contact you within 2 business hours.', 'success');
  };

  const faqs = [
    {
      q: 'Do you offer free white-glove delivery and assembly?',
      a: 'Yes, 100% complimentary! Our factory-trained showroom technicians deliver, assemble, and position all furniture in your room of choice and clear away packing materials.'
    },
    {
      q: 'What does the 10-year showroom warranty cover?',
      a: 'Our comprehensive warranty covers all kiln-dried solid wood against termite attacks, borer insects, structural joint cracks, and hydraulic bed mechanism failures.'
    },
    {
      q: 'How does the 30-day trial and return policy work?',
      a: 'If any furniture piece does not match your home layout or lighting, submit a return request from your Account dashboard within 30 days. We arrange free doorstep pickup and 100% refund.'
    },
    {
      q: 'Can I customize the upholstery fabric or wood finish?',
      a: 'Yes! You can choose from dozens of premium Italian velvet, leatherette, and linen fabrics, as well as natural honey, dark walnut, or warm teak polish at any of our experience centers.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block">
          Showroom Concierge
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury text-stone-900">
          Get in Touch with CP Furniture
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Have questions about wood species, custom sizing, delivery timelines, or showroom bookings? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
            Send Us an Inquiry
          </h2>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-950 text-lg">Thank You, {name}!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Your message has been assigned ticket #CPF-{Date.now().toString().slice(-6)}. A dedicated furniture advisor will reach out to {phone || email} shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="text-xs text-amber-900 font-bold underline pt-2 block"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikramaditya Roy"
                    className="w-full p-2.5 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vikram@domain.com"
                    className="w-full p-2.5 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full p-2.5 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Topic / Inquiry Type</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                  >
                    <option>Showroom Visit & Consultation</option>
                    <option>Order Delivery & Tracking Status</option>
                    <option>Custom Sizing & Fabric Finishes</option>
                    <option>Warranty Claim or Service Request</option>
                    <option>Bulk & Corporate Architect Orders</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Message *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your furniture inquiry or room requirements..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl transition-all shadow cursor-pointer"
              >
                Submit Showroom Message
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Direct Contacts & Hours (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white space-y-6">
            <h3 className="font-bold text-lg font-serif-luxury text-amber-400">
              Corporate Headquarters & Showroom Hub
            </h3>

            <div className="space-y-4 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Central Showroom & Flagship:</strong>
                  <span>{websiteContent.headquartersAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Toll-Free Concierge:</strong>
                  <span>{websiteContent.contactPhone}</span>
                  <span className="block text-[11px] text-stone-400">Available Mon-Sun, 9am - 9pm</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Customer Support:</strong>
                  <span>{websiteContent.contactEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Experience Centers Hours:</strong>
                  <span>{websiteContent.showroomHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Everything you need to know about purchasing, delivery, and guarantees.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
              <h3 className="font-bold text-sm text-stone-900">{faq.q}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
