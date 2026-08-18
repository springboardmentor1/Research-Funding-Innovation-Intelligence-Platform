import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Users, Database, Activity } from 'lucide-react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
          Administrator Platform Management Console
        </h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          User access control, role assignment, data pipeline status, and system monitoring
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
        <h3 className="text-sm font-extrabold text-[#1a2530] mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#24527a]" /> Registered System Users ({users.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#24527a] border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2ded4] text-[#576574] font-bold">
                  <th className="pb-3 px-3">ID</th>
                  <th className="pb-3 px-3">Full Name</th>
                  <th className="pb-3 px-3">Email</th>
                  <th className="pb-3 px-3">Assigned Role</th>
                  <th className="pb-3 px-3">Organization</th>
                  <th className="pb-3 px-3">Research Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ded4] text-[#1a2530]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8f6f0]">
                    <td className="py-3 px-3 font-mono text-[#576574] font-bold">#{u.id}</td>
                    <td className="py-3 px-3 font-bold text-[#1a2530]">{u.full_name}</td>
                    <td className="py-3 px-3 text-[#576574]">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#24527a]/15 text-[#24527a] font-extrabold text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">{u.organization || '—'}</td>
                    <td className="py-3 px-3 font-bold text-[#247291]">{u.research_domain || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
