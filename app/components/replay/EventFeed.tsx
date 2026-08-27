import React from 'react';
import { RaceEvent } from '../../lib/replayDataService';

interface EventFeedProps {
  events: RaceEvent[];
  currentLap: number;
  onSelectEvent: (ev: RaceEvent) => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({
  events,
  currentLap,
  onSelectEvent
}) => {
  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl flex flex-col h-[400px] relative z-10"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">🚩</span>
          <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
            RACE EVENT FEED
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
          {events.length} EVENTS RECORDED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 font-mono">
        {events.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No race incidents or events recorded for this session.
          </div>
        ) : (
          events.map((ev) => {
            const isCurrent = ev.lap === currentLap;
            let icon = '🟡';
            let badgeBg = 'bg-amber-950/40 text-amber-400 border-amber-800/50';

            if (ev.type === 'red_flag') { icon = '🔴'; badgeBg = 'bg-red-950/60 text-red-400 border-red-800/60'; }
            if (ev.type === 'green_flag') { icon = '🟢'; badgeBg = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'; }
            if (ev.type === 'pit_stop') { icon = '🔧'; badgeBg = 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60'; }
            if (ev.type === 'overtake') { icon = '🏎️'; badgeBg = 'bg-purple-950/60 text-purple-400 border-purple-800/60'; }
            if (ev.type === 'finish') { icon = '🏁'; badgeBg = 'bg-slate-800 text-white border-slate-700'; }

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                    : 'bg-[#0D121F] hover:bg-slate-800/80 border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span>{icon}</span>
                    <span className="font-black text-white">{ev.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${badgeBg}`}>
                    LAP {ev.lap}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-semibold pl-5">
                  {ev.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
