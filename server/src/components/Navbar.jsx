import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/', label: 'AI Chat' },
    { path: '/book', label: 'Book Session' },
    { path: '/pain-score', label: 'Pain Score' },
    { path: '/login', label: 'Therapist Login' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-2 flex-wrap">
      {links.map((link) => (
        <button
          key={link.path}
          onClick={() => navigate(link.path)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            location.pathname === link.path
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {link.label}
        </button>
      ))}
    </div>
  );
}