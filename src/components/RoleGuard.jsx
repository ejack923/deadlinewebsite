import { ShieldOff } from "lucide-react";

// allowedRoles: array of roles that can access e.g. ["admin", "solicitor"]
export default function RoleGuard({ user, allowedRoles, children }) {
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-sm">
            Your role (<strong>{user.role}</strong>) does not have permission to access this page. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }
  return children;
}