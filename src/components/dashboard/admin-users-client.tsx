"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";
import { AdminAddUserForm } from "@/components/dashboard/admin-add-user-form";
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

type Props = {
  fullName: string;
  role: string;
};

type UserData = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export function AdminUsersClient({ fullName, role }: Props) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateSort, setDateSort] = useState<"default" | "desc" | "asc">("default");
  const itemsPerPage = 8;

  const toggleDateSort = () => {
    if (dateSort === "default") setDateSort("desc");
    else if (dateSort === "desc") setDateSort("asc");
    else setDateSort("default");
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/users", { withCredentials: true });
      setUsers(res.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, { withCredentials: true });
      setUsers(users.filter((user) => user._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      await axios.put(`/api/admin/users/${id}`, { role: newRole }, { withCredentials: true });
      setUsers(users.map((user) => (user._id === id ? { ...user, role: newRole } : user)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    if (dateSort === "default") return 0;
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateSort === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const MathMin = Math.min;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row lg:h-[calc(100dvh-16px)] sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <DashboardSidebar fullName={fullName} role={role} />

        <section className="w-full p-3 sm:p-4 lg:p-6 overflow-y-auto">
          <DashboardMobileNav role={role} />

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4 mb-4">
            <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Manage Users</h2>
            <p className="text-sm text-slate-500">System user directory and role management</p>
          </header>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <div className="relative min-w-[140px]">
                <select
                  className="appearance-none w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 pr-10 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="client">Client</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <span className="text-sm text-slate-500">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-3 py-3">
                        <button
                          onClick={toggleDateSort}
                          className="flex items-center gap-1 hover:text-slate-700 transition"
                        >
                          Joined Date
                          <ArrowDownIcon 
                            className={`h-4 w-4 transition-all duration-300 ${
                              dateSort === "default" 
                                ? "opacity-30" 
                                : dateSort === "asc"
                                ? "rotate-180 opacity-100"
                                : "opacity-100"
                            }`} 
                          />
                        </button>
                      </th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user._id} className="border-b border-slate-100 text-sm text-slate-700">
                        <td className="px-3 py-3 font-medium whitespace-nowrap">{user.name}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{user.email}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="relative inline-block min-w-[100px]">
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user._id, e.target.value)}
                              className="appearance-none w-full cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 pr-7 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 hover:bg-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="client">Client</option>
                              <option value="analyst">Analyst</option>
                              <option value="admin">Admin</option>
                            </select>
                            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="text-xs font-semibold text-red-600 transition hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filteredUsers.length === 0 && !error && (
               <p className="mt-4 text-center text-sm text-slate-500">
                 {users.length === 0 ? "No users found." : "No matching users found based on filters."}
               </p>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {MathMin(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </article>

           
        </section>
      </section>
    </main>
  );
}
