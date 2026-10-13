import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Layers, BookOpen } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Institution Branding Panel */}
        <div className="bg-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-xs">
                E
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-tight">EDUSPHERE</h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Unified CampusHub</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-white">
                One Unified Academic & Campus Platform
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Consolidating academic tracking, attendance, classroom operations, and student services into a single role-based institution platform.
              </p>
            </div>

            <div className="mt-8 space-y-3 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <GraduationCap className="w-4 h-4 text-brand-400 shrink-0" />
                <span>First-Year Student Enrolment & Academic Lifecycle</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Layers className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Section & Teaching Assignment Access Control</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Verified Attendance & Academic Assessment Records</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Role-Based Institutional Governance & Audit Logs</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 text-[11px] text-slate-500 border-t border-slate-800/80">
            Official Institution Management System • B.E. Final Year Project
          </div>
        </div>

        {/* Right Form Viewport */}
        <div className="p-8 lg:p-10 flex flex-col justify-center bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
