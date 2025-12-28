'use client';

import { useState } from 'react';
import { Calendar, X, Check } from 'lucide-react';
import { addProviderAppointment, isNative } from '@/lib/capacitor';

interface AddToCalendarButtonProps {
  providerName: string;
  providerAddress?: string;
}

export function AddToCalendarButton({ providerName, providerAddress }: AddToCalendarButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!date) return;

    setAdding(true);
    try {
      const appointmentDate = new Date(`${date}T${time}`);
      const success = await addProviderAppointment(providerName, providerAddress, appointmentDate);

      if (success) {
        setAdded(true);
        setTimeout(() => {
          setShowPicker(false);
          setAdded(false);
          setDate('');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to add to calendar:', error);
    } finally {
      setAdding(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-sage)]/20 text-[var(--color-charcoal)] font-medium hover:bg-[var(--color-sage)]/30 transition-colors"
      >
        <Calendar size={18} />
        Add to Calendar
      </button>

      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Picker popup */}
          <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-[var(--color-cream-dark)] z-50 min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--color-charcoal)]">Schedule Appointment</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1 text-[var(--color-charcoal-light)] hover:text-[var(--color-charcoal)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[var(--color-charcoal-light)] mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--color-charcoal-light)] mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-cream-dark)] focus:border-[var(--color-teal)] focus:outline-none"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!date || adding}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-teal)] text-white font-semibold hover:bg-[var(--color-teal-dark)] transition-colors disabled:opacity-50"
              >
                {added ? (
                  <>
                    <Check size={18} />
                    Added!
                  </>
                ) : adding ? (
                  'Adding...'
                ) : (
                  <>
                    <Calendar size={18} />
                    Add to Calendar
                  </>
                )}
              </button>

              {!isNative() && (
                <p className="text-xs text-[var(--color-charcoal-light)] text-center">
                  Opens Google Calendar on web
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
