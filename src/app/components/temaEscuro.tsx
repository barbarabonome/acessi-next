import { useEffect, useState } from 'react';

// Componente principal onde o tema é gerenciado
const TemaEscuro = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="flex items-center">
      <button
        onClick={toggleTheme}
        className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
          isDark ? 'bg-slate-900' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          <span className="absolute text-xs top-1 left-1">
            {isDark ? '🌙' : '🌞'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default TemaEscuro;
