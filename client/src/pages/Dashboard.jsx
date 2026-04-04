import { useState, useEffect } from 'react';
import { getSessions, triggerReminder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [painScores, setPainScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState(null);

  useEffect(() => {
    getSessions()
      .then((res) => setSessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    const q = query(
      collection(db, 'painScores'),
      where('patientId', '==', selectedPatient),
      orderBy('recordedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPainScores(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [selectedPatient]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTriggerReminder = async (sessionId) => {
    setTriggeringId(sessionId);
    try {
      await triggerReminder(sessionId);
      alert('WhatsApp reminder sent!');
      const res = await getSessions();
      setSessions(res.data);
    } catch (err) {
      alert('Failed to send reminder: ' + err.message);
    } finally {
      setTriggeringId(null);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    sent_24h: 'bg-blue-100 text-blue-700',
    sent_1h: 'bg-purple-100 text-purple-700',
    done: 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">CasaMed Therapist Dashboard</h1>
          <p className="text-blue-200 text-sm">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
        >
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Patient Sessions</h2>

        {loading ? (
          <p className="text-gray-400">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-400">No sessions found.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Therapist</th>
                  <th className="px-4 py-3 text-left">Reminder</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s._id}
                    className={`border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition ${selectedPatient === s.patientName ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedPatient(s.patientName)}
                  >
                    <td className="px-4 py-3 font-medium text-blue-700 underline">{s.patientName}</td>
                    <td className="px-4 py-3">{s.phoneNumber}</td>
                    <td className="px-4 py-3 capitalize">{s.sessionType}</td>
                    <td className="px-4 py-3">
                      {new Date(s.sessionDateTime).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">{s.therapistName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[s.reminderStatus]}`}>
                        {s.reminderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleTriggerReminder(s._id)}
                        disabled={triggeringId === s._id}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {triggeringId === s._id ? 'Sending...' : 'Send Reminder'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedPatient && (
          <div className="mt-8 bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-700">
                Pain Score Log — {selectedPatient}
              </h2>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              To add pain scores for this patient, go to <strong>/pain-score</strong> and enter Patient ID as: <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">{selectedPatient}</span>
            </p>
            {painScores.length === 0 ? (
              <p className="text-gray-400">No pain scores recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {painScores.map((ps) => (
                  <div key={ps.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-3">
                    <div className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${ps.score <= 3 ? 'bg-green-100 text-green-700' : ps.score <= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {ps.score}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{ps.note || 'No note'}</p>
                      <p className="text-xs text-gray-400">{new Date(ps.recordedAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}