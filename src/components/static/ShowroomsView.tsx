import React, { useState } from 'react';
import { MapPin, Phone, Clock, Calendar, CheckCircle2, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShowroomsView: React.FC = () => {
  const { websiteContent, showToast } = useApp();
  const [selectedShowroom, setSelectedShowroom] = useState(websiteContent.showrooms[0]?.id || '');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentName, setAppointmentName] = useState('');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentName || !appointmentPhone || !appointmentDate) {
      showToast('Please select a date and enter your contact details.', 'warning');
      return;
    }
    setIsBooked(true);
    showToast('Your private showroom consultation is scheduled!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block">
          Tactile Showroom Experience
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury text-stone-900">
          Our Experience Centers
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Walk through our full-scale furnished master bedrooms, designer living suites, and ergonomics labs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {websiteContent.showrooms.map((sr) => (
          <div
            key={sr.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] bg-stone-100 overflow-hidden relative">
                <img
                  src={sr.image}
                  alt={sr.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  {sr.city}
                </span>
              </div>

              <div className="p-6 space-y-3 text-xs text-stone-600">
                <h3 className="font-bold text-base text-stone-900 font-serif-luxury">{sr.name}</h3>

                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
                  <span>{sr.address}</span>
                </p>

                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-800 flex-shrink-0" />
                  <span>{sr.phone}</span>
                </p>

                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-800 flex-shrink-0" />
                  <span>{sr.timing}</span>
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setSelectedShowroom(sr.id);
                  const el = document.getElementById('appointment-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 bg-stone-900 hover:bg-amber-900 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Book VIP Designer Visit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Booking Section */}
      <div id="appointment-section" className="bg-stone-50 rounded-3xl p-8 sm:p-12 border border-stone-200 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Book a 1-on-1 Interior Specialist Session
          </h2>
          <p className="text-xs text-stone-500">
            Complimentary 3D floor plan review, timber selection guidance, and fabric swatches box.
          </p>
        </div>

        {isBooked ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-950 text-base">VIP Appointment Scheduled!</h3>
            <p className="text-xs text-emerald-800">
              Thank you {appointmentName}. Our senior design associate will meet you at our showroom on {appointmentDate}. A confirmation SMS has been dispatched.
            </p>
            <button
              onClick={() => setIsBooked(false)}
              className="text-xs text-amber-900 font-bold underline pt-2 block"
            >
              Book another appointment
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={appointmentName}
                  onChange={(e) => setAppointmentName(e.target.value)}
                  placeholder="e.g. Rohan Verma"
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={appointmentPhone}
                  onChange={(e) => setAppointmentPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Center</label>
                <select
                  value={selectedShowroom}
                  onChange={(e) => setSelectedShowroom(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                >
                  {websiteContent.showrooms.map((sr) => (
                    <option key={sr.id} value={sr.id}>
                      {sr.name} ({sr.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl transition-colors shadow cursor-pointer mt-2"
            >
              Confirm VIP Showroom Appointment
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
