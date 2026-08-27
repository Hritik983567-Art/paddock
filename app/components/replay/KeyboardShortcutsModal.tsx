import React from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#080C14] border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⌨️</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              KEYBOARD SHORTCUTS GUIDE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
            <span className="font-bold text-cyan-400">Space</span>
            <span className="text-slate-300">Play / Pause Replay</span>
          </div>

          <div className="flex justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
            <span className="font-bold text-cyan-400">&larr; / &rarr;</span>
            <span className="text-slate-300">Step Backward / Forward 10 Sec</span>
          </div>

          <div className="flex justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
            <span className="font-bold text-cyan-400">Shift + &larr; / &rarr;</span>
            <span className="text-slate-300">Jump Previous / Next Lap</span>
          </div>

          <div className="flex justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
            <span className="font-bold text-cyan-400">R</span>
            <span className="text-slate-300">Reset Replay to Start</span>
          </div>

          <div className="flex justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
            <span className="font-bold text-cyan-400">1 / 2 / 3 / 4 / 5</span>
            <span className="text-slate-300">Set Speed (0.25x &rarr; 4x)</span>
          </div>

          <div className="flex justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
            <span className="font-bold text-cyan-400">Esc</span>
            <span className="text-slate-300">Close Modals & Fullscreen</span>
          </div>

          <div className="flex justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
            <span className="font-bold text-cyan-400">?</span>
            <span className="text-slate-300">Open Keyboard Shortcuts</span>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-lg"
          >
            GOT IT &bull; CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
