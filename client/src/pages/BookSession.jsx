import { useState } from 'react';
import { createSession } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function BookSession() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName: '',
    phoneNumber: '',
    sessionType: 'clinic',
    sessionDateTime: '',
    therapistName: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await createSession(form);
      setSuccess(`Session created! ID: ${res.data.session._id}`);
      setForm({
        patientName: '',
        phoneNumber: '',
        sessionType: 'clinic',
        sessionDateTime: '',
        therapistName: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-1">Book a Session</h1>
        <p className="text-gray-500 text-sm mb-6">
          Schedule a physiotherapy session and queue reminders
        </p>

        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rahul Sharma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (with country code)
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="919876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Type
            </label>
            <select
              name="sessionType"
              value={form.sessionType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="clinic">Clinic</option>
              <option value="home">Home</option>
              <option value="tele">Tele</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Date & Time
            </label>
            <input
              type="datetime-local"
              name="sessionDateTime"
              value={form.sessionDateTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Therapist Name
            </label>
            <input
              type="text"
              name="therapistName"
              value={form.therapistName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dr. Priya Singh"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Book Session'}
          </button>
        </form>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50"
          >
            AI Chat
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Therapist Login
          </button>
        </div>
      </div>
    </div>
  );
}