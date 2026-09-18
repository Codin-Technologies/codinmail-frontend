'use client';

import { DeviceSettings, Meeting, MeetingParticipant } from '@/lib/meet/types';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  ChevronDown,
  Mic,
  MicOff,
  Settings2,
  Sliders,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

type PreJoinScreenProps = {
  meeting: Meeting;
  currentUser: MeetingParticipant;
  deviceSettings: DeviceSettings;
  onUpdateDeviceSettings: (settings: DeviceSettings) => void;
  onJoinNow: (participant: MeetingParticipant) => void;
  onBack: () => void;
};

function formatTime(isoString: string) {
  try {
    const t = isoString.split('T')[1]?.slice(0, 5);
    if (!t) return 'Now';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch { return ''; }
}

export function PreJoinScreen({
  meeting,
  currentUser,
  deviceSettings,
  onUpdateDeviceSettings,
  onJoinNow,
  onBack,
}: PreJoinScreenProps) {
  const [displayName, setDisplayName] = useState(currentUser.name.replace(' (You)', ''));
  const [isMicMuted, setIsMicMuted] = useState(deviceSettings.isMicMuted);
  const [isVideoOff, setIsVideoOff] = useState(deviceSettings.isVideoOff);
  const [isBlur, setIsBlur] = useState(deviceSettings.isVirtualBackgroundEnabled);
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (isMicMuted) { setAudioLevel(0); return; }
    const interval = setInterval(() => setAudioLevel(Math.floor(20 + Math.random() * 60)), 200);
    return () => clearInterval(interval);
  }, [isMicMuted]);

  const handleJoin = () => {
    onJoinNow({
      ...currentUser,
      name: displayName.trim() || currentUser.name,
      isMuted: isMicMuted,
      isVideoOn: !isVideoOff,
    });
  };

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      {/* ── Left: Camera Preview ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-gray-950 relative overflow-hidden">
        {/* Camera canvas */}
        {!isVideoOff ? (
          <div className="absolute inset-0">
            <img
              src={currentUser.avatar || ''}
              alt="You"
              className={`w-full h-full object-cover transition-all ${isBlur ? 'blur-sm scale-105' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 grid place-items-center text-white text-4xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-white/60 font-medium">Camera is off</span>
            </div>
          </div>
        )}

        {/* Name tag overlay */}
        <div className="absolute bottom-20 left-5 text-white font-bold text-sm drop-shadow">
          {displayName} <span className="opacity-60 font-normal text-xs">(You)</span>
        </div>

        {/* Bottom controls over video */}
        <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3">
          <button
            onClick={() => { const n = !isMicMuted; setIsMicMuted(n); onUpdateDeviceSettings({ ...deviceSettings, isMicMuted: n }); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${isMicMuted ? 'bg-red-600 text-white' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'}`}
            title={isMicMuted ? 'Unmute' : 'Mute'}
          >
            {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            onClick={() => { const n = !isVideoOff; setIsVideoOff(n); onUpdateDeviceSettings({ ...deviceSettings, isVideoOff: n }); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${isVideoOff ? 'bg-red-600 text-white' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'}`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <CameraOff size={18} /> : <Camera size={18} />}
          </button>

          <button
            onClick={() => { const n = !isBlur; setIsBlur(n); onUpdateDeviceSettings({ ...deviceSettings, isVirtualBackgroundEnabled: n }); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${isBlur ? 'bg-primary text-white' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'}`}
            title="Background blur"
          >
            <Sparkles size={17} />
          </button>

          <button
            onClick={() => setShowDevicePanel(v => !v)}
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 flex items-center justify-center shadow-lg"
            title="Audio & video settings"
          >
            <Sliders size={17} />
          </button>
        </div>

        {/* Audio meter */}
        {!isMicMuted && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1.5 rounded-full text-[11px] text-white font-medium">
            <Mic size={11} className="text-emerald-400" />
            <div className="flex items-end gap-0.5 h-3">
              {[40, 70, 55, audioLevel, 45].map((h, i) => (
                <div key={i} className="w-0.5 bg-emerald-400 rounded-full transition-all duration-100" style={{ height: `${Math.min(h, 100) * 0.12}rem` }} />
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/80 hover:text-white hover:bg-black/60 transition-all font-medium"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
      </div>

      {/* ── Right: Join Panel ── */}
      <aside className="w-80 shrink-0 bg-card border-l border-border flex flex-col h-full overflow-hidden">
        {/* Meeting info header */}
        <div className="px-6 pt-6 pb-5 border-b border-border space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {meeting.provider === 'google_meet' ? 'Google Meet' : 'Codin'}
            </span>
          </div>
          <h2 className="font-extrabold text-lg text-foreground leading-tight line-clamp-2">
            {meeting.title}
          </h2>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Video size={12} className="text-primary shrink-0" />
              <span>{formatTime(meeting.scheduledStart)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="shrink-0" />
              <span>{meeting.participants.length} invited attendees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 shrink-0" />
              <span className="font-mono text-[10px]">{meeting.meetingCode}</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Display name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Status summary */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Microphone</span>
              <span className={`font-bold ${isMicMuted ? 'text-red-500' : 'text-emerald-600'}`}>
                {isMicMuted ? 'Muted' : 'On'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Camera</span>
              <span className={`font-bold ${isVideoOff ? 'text-red-500' : 'text-emerald-600'}`}>
                {isVideoOff ? 'Off' : 'On'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Background</span>
              <span className="font-bold text-foreground">{isBlur ? 'Blur' : 'None'}</span>
            </div>
          </div>

          {/* Device selectors */}
          {showDevicePanel && (
            <div className="space-y-3 pt-1 border-t border-border text-xs">
              <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Devices</p>
              {[
                { label: 'Microphone', options: ['Default Microphone', 'External USB Mic (Yeti)', 'AirPods Pro'] },
                { label: 'Camera', options: ['FaceTime HD (Built-in)', 'Logitech Brio 4K'] },
                { label: 'Speaker', options: ['MacBook Speakers', 'AirPods Pro (Spatial Audio)'] },
              ].map(({ label, options }) => (
                <div key={label}>
                  <label className="block text-muted-foreground mb-1">{label}</label>
                  <select className="w-full h-8 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary">
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">AI Noise Suppression</span>
                <input
                  type="checkbox"
                  defaultChecked={deviceSettings.isNoiseSuppressionEnabled}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Join button */}
        <div className="px-6 pb-6 pt-4 border-t border-border">
          <button
            onClick={handleJoin}
            className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow hover:opacity-90 transition-opacity"
          >
            <Video size={17} />
            Join Meeting
          </button>
          <p className="text-[10px] text-center text-muted-foreground mt-2.5">
            No one can see or hear you until you join
          </p>
        </div>
      </aside>
    </div>
  );
}
