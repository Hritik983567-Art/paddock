'use client';

import React from 'react';
import PermissionDeniedState from '../components/states/PermissionDeniedState';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <PermissionDeniedState requiredRole="Telemetry Analyst / Race Engineer" />
    </div>
  );
}
