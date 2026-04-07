"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ApprovalsClient({ initialNavItems }: any) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAgents();
  }, [supabase]);

  async function loadAgents() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, approval_status, created_at')
      .eq('admin_id', user.id)
      .eq('role', 'agent')
      .order('created_at', { ascending: false });

    if (data) setAgents(data);
    setLoading(false);
  }

  async function handleStatusUpdate(agentId: string, status: string) {
    const { error } = await supabase.from('profiles').update({ approval_status: status }).eq('id', agentId);
    if (error) {
      toast.error('Failed to update agent status');
    } else {
      toast.success(`Agent status updated to ${status}`);
      loadAgents();
    }
  }

  const pending = agents.filter(a => a.approval_status === 'pending');
  const active = agents.filter(a => a.approval_status !== 'pending');

  return (
    <div className="animate-in pb-20">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agent Approvals</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your team&apos;s access</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mt-8 mb-4">Pending Requests ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="empty-state card">No pending requests.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {pending.map(agent => (
            <div key={agent.id} className="card flex items-center justify-between p-4 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="avatar avatar-amber">{agent.full_name?.charAt(0) || 'A'}</div>
                <div>
                  <div className="font-semibold text-md">{agent.full_name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Applied on {new Date(agent.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleStatusUpdate(agent.id, 'approved')} className="btn btn-sm btn-primary bg-green-500 hover:bg-green-600">Approve</button>
                <button onClick={() => handleStatusUpdate(agent.id, 'rejected')} className="btn btn-sm btn-danger border-red-200">Reject</button>
                <button onClick={() => handleStatusUpdate(agent.id, 'blocked')} className="btn btn-sm btn-ghost hover:text-red-500">Block</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-bold mt-12 mb-4">Past Decisions ({active.length})</h2>
      <div className="flex flex-col gap-4">
        {active.map(agent => (
          <div key={agent.id} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="avatar avatar-blue">{agent.full_name?.charAt(0) || 'A'}</div>
              <div>
                <div className="font-semibold">{agent.full_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`badge ${agent.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {agent.approval_status}
              </span>
              {agent.approval_status !== 'blocked' && agent.approval_status !== 'rejected' && (
                <button onClick={() => handleStatusUpdate(agent.id, 'blocked')} className="text-xs text-red-500 hover:underline">Block Access</button>
              )}
              {agent.approval_status !== 'approved' && (
                <button onClick={() => handleStatusUpdate(agent.id, 'approved')} className="text-xs text-green-500 hover:underline">Re-Approve</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
