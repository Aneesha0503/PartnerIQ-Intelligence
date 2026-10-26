import React from 'react';
import { X, Database, CheckCircle, Info, Shield, Layers, HardDrive } from 'lucide-react';

export default function FirebaseConfigModal({ isOpen, onClose, firebaseStatus }) {
  if (!isOpen) return null;

  const isLive = firebaseStatus?.is_live;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isLive 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Firebase Firestore Infrastructure
              </h3>
              <p className="text-xs text-slate-400">
                Database configuration & real-time persistence status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isLive
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
              : 'bg-blue-950/20 border-blue-800/40 text-blue-200'
          }`}>
            <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isLive ? 'text-emerald-400' : 'text-blue-400'}`} />
            <div>
              <div className="text-sm font-semibold mb-1">
                {isLive ? 'Connected to Google Cloud Firestore' : 'Firestore-Compatible Persistent Mode (Active)'}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {isLive
                  ? `Authenticated and synchronizing data live to Google Cloud Project: ${firebaseStatus?.project_id}`
                  : `Operating on full Firestore-compatible document store with persistent disk backup. Supports seamless transition to Google Cloud Firestore credentials.`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Companies</span>
              <div className="text-xl font-bold text-white mt-1">
                {firebaseStatus?.collections?.companies ?? 0}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Evaluations</span>
              <div className="text-xl font-bold text-white mt-1">
                {firebaseStatus?.collections?.evaluations ?? 0}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-center">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Matrices</span>
              <div className="text-xl font-bold text-white mt-1">
                {firebaseStatus?.collections?.matrices ?? 0}
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> Storage Backend:
              </span>
              <span className="font-mono text-slate-200 truncate max-w-xs">
                {firebaseStatus?.storage_path || 'Firestore API'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Security Mode:
              </span>
              <span className="text-emerald-400 font-medium">Role-Enforced Read/Write</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Schema:
              </span>
              <span className="text-slate-300 font-mono">companies, evaluations, matrices, audit_logs</span>
            </div>
          </div>

          {/* How to connect GCP live Firestore */}
          <div className="p-3.5 rounded-lg bg-slate-800/30 border border-slate-700/40 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-400" /> Connecting your own Firebase Project:
            </div>
            <p className="text-[11px] leading-relaxed">
              Place your Firebase Service Account JSON file at <code className="text-blue-300">backend/firebase_credentials.json</code> or set <code className="text-blue-300">FIREBASE_PROJECT_ID</code> in <code className="text-blue-300">backend/.env</code>. The backend connects automatically upon restart!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
