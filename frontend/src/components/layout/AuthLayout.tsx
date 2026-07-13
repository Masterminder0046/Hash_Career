import { Outlet } from 'react-router-dom';
import LogoIcon from './LogoIcon';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm text-white hover:scale-105 transition-transform duration-300">
              <LogoIcon className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold text-white">Hash Career</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Your AI-Powered<br />
            Placement Preparation<br />
            Platform
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Get personalized placement preparation with AI-driven resume analysis,
            company matching, mock interviews, and skill gap detection.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex gap-4 text-white/50 text-sm">
            <span>AI Analysis</span>
            <span>Company Matching</span>
            <span>Mock Interviews</span>
            <span>Skill Gap</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
