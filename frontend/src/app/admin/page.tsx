"use client";

import { useState, useEffect } from "react";
import { adminApi, SystemStatsResponse } from "@/lib/api/admin";

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStatsResponse | null>(null);

  useEffect(() => {
    adminApi.getStats().then(setStats);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{stats.total_users}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">{stats.active_users}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Voices</p>
            <p className="text-2xl font-bold">{stats.total_voices}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Processing Jobs</p>
            <p className="text-2xl font-bold">{stats.processing_jobs}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pending Jobs</p>
            <p className="text-2xl font-bold">{stats.pending_jobs}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold">{stats.total_jobs}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Storage Used</p>
            <p className="text-2xl font-bold">{stats.storage_used_gb.toFixed(2)} GB</p>
          </div>
        </div>
      )}
    </div>
  );
}
