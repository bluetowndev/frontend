import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import UserMovementTracker from "../components/admin/UserMovementTracker";
import SiteAllocationManager from "../components/admin/SiteAllocationManager";
import ExcelTargetUpload from "../components/admin/ExcelTargetUpload";
import ExcelAchievementUpload from "../components/admin/ExcelAchievementUpload";

const apiUrl = process.env.REACT_APP_API_URL || "";

const statesAndUTs = [
  "Bihar",
  "Delhi",
  "Himachal Pradesh",
  "Jharkhand",
  "Madhya Pradesh",
  "Rajasthan",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "all",
];

const base64FromFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [filters, setFilters] = useState({
    state: "all",
    email: "",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [attendanceForm, setAttendanceForm] = useState({
    userId: "",
    purpose: "Check In",
    subPurpose: "",
    feedback: "",
    locationLat: "",
    locationLng: "",
    imageFile: null,
  });
  const [markingAttendance, setMarkingAttendance] = useState(false);

  const token = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token;
  }, []);

  const fetchSuperadminData = useCallback(async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/api/user/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${apiUrl}/api/attendance/admin-dashboard-stats?startDate=${filters.startDate}&endDate=${filters.endDate}&state=${filters.state}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      if (!usersRes.ok) {
        toast.error(usersData.error || "Failed to fetch users");
      } else {
        setUsers(Array.isArray(usersData) ? usersData : []);
      }

      if (!statsRes.ok || !statsData.success) {
        toast.error(statsData.error || "Failed to fetch superadmin stats");
      } else {
        setStats(statsData.stats);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load superadmin dashboard");
    } finally {
      setLoading(false);
    }
  }, [filters.endDate, filters.startDate, filters.state, token]);

  const fetchEngineersByState = useCallback(async () => {
    if (!token || !selectedState) {
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/user/engineers?state=${selectedState}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to fetch engineers");
        return;
      }
      setEngineers(data.engineers || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch engineers");
    }
  }, [selectedState, token]);

  useEffect(() => {
    fetchSuperadminData();
  }, [fetchSuperadminData]);

  useEffect(() => {
    fetchEngineersByState();
  }, [fetchEngineersByState]);

  const handleMarkAttendance = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    if (!attendanceForm.userId || !attendanceForm.imageFile) {
      toast.error("Select user and image");
      return;
    }
    if (!attendanceForm.locationLat || !attendanceForm.locationLng) {
      toast.error("Latitude and longitude are required");
      return;
    }

    setMarkingAttendance(true);
    try {
      const imageData = await base64FromFile(attendanceForm.imageFile);
      const formData = new FormData();
      formData.append("image", imageData);
      formData.append(
        "location",
        JSON.stringify({
          lat: Number(attendanceForm.locationLat),
          lng: Number(attendanceForm.locationLng),
        })
      );
      formData.append("purpose", attendanceForm.purpose);
      formData.append("feedback", attendanceForm.feedback);
      formData.append("userId", attendanceForm.userId);
      if (attendanceForm.subPurpose) {
        formData.append("subPurpose", attendanceForm.subPurpose);
      }

      const response = await fetch(`${apiUrl}/api/attendance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to mark attendance");
        return;
      }

      toast.success("Attendance marked successfully");
      setAttendanceForm((prev) => ({
        ...prev,
        feedback: "",
        subPurpose: "",
        imageFile: null,
      }));
      fetchSuperadminData();
    } catch (error) {
      toast.error(error.message || "Failed to mark attendance");
    } finally {
      setMarkingAttendance(false);
    }
  };

  const userOnlyOptions = users.filter((u) => u.role === "user");

  const downloadExcel = (rows, filename, sheetName = "Report") => {
    if (!rows || rows.length === 0) {
      toast.error("No data available to download");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    toast.success("Download started");
  };

  const topPerformerRows = (stats?.topPerformers || []).map((p, index) => ({
    Rank: index + 1,
    Name: p.fullName,
    Email: p.email,
    State: p.state,
    AttendanceEntries: p.attendanceCount,
    SiteVisits: p.siteVisits,
  }));

  const recentActivityRows = (stats?.recentActivity || []).map((a) => ({
    Name: a.user?.fullName || "N/A",
    Email: a.user?.email || "N/A",
    State: a.user?.state || "N/A",
    Purpose: a.purpose,
    Location: a.locationName || "N/A",
    Date: a.date,
    Timestamp: a.timestamp ? new Date(a.timestamp).toLocaleString("en-IN") : "",
  }));

  const stateStatsRows = Object.entries(stats?.stateWiseStats || {}).map(
    ([stateName, stateStat]) => ({
      State: stateName,
      TotalUsers: stateStat.totalUsers,
      ActiveUsers: stateStat.activeUsers,
      AttendanceEntries: stateStat.attendanceCount,
    })
  );

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Unified visibility across admin and statehead workflows.
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-2">
        {[
          ["overview", "Overview"],
          ["movement", "Movement"],
          ["statehead", "Statehead"],
          ["mark-attendance", "Mark Attendance"],
          ["sites", "Sites"],
          ["targets", "Targets"],
          ["achievements", "Achievements"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(activeTab === "overview" || activeTab === "movement") && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, state: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {statesAndUTs.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setFilters((prev) => ({
                    ...prev,
                    startDate: date.toISOString().split("T")[0],
                  }));
                }}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setFilters((prev) => ({
                    ...prev,
                    endDate: date.toISOString().split("T")[0],
                  }));
                }}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchSuperadminData}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats?.overview?.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{stats?.overview?.activeUsers || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Attendance Entries</p>
              <p className="text-2xl font-bold">
                {stats?.overview?.totalAttendanceEntries || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Site Visits</p>
              <p className="text-2xl font-bold">{stats?.overview?.siteVisits || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  downloadExcel(stateStatsRows, "superadmin_state_wise_stats", "StateStats")
                }
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Download State-wise Stats
              </button>
              <button
                onClick={() =>
                  downloadExcel(topPerformerRows, "superadmin_top_performers", "TopPerformers")
                }
                className="px-3 py-2 bg-green-600 text-white rounded-lg"
              >
                Download Top Performers
              </button>
              <button
                onClick={() =>
                  downloadExcel(recentActivityRows, "superadmin_recent_activity", "RecentActivity")
                }
                className="px-3 py-2 bg-blue-600 text-white rounded-lg"
              >
                Download Recent Activity
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">State-wise Stats</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">State</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Total Users</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Active Users</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Attendance Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stateStatsRows.map((row) => (
                  <tr key={row.State}>
                    <td className="px-4 py-2 text-sm">{row.State}</td>
                    <td className="px-4 py-2 text-sm">{row.TotalUsers}</td>
                    <td className="px-4 py-2 text-sm">{row.ActiveUsers}</td>
                    <td className="px-4 py-2 text-sm">{row.AttendanceEntries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Top Performers</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">State</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Attendance</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Site Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topPerformerRows.map((row) => (
                  <tr key={`${row.Email}-${row.Rank}`}>
                    <td className="px-4 py-2 text-sm">{row.Rank}</td>
                    <td className="px-4 py-2 text-sm">{row.Name}</td>
                    <td className="px-4 py-2 text-sm">{row.Email}</td>
                    <td className="px-4 py-2 text-sm">{row.State}</td>
                    <td className="px-4 py-2 text-sm">{row.AttendanceEntries}</td>
                    <td className="px-4 py-2 text-sm">{row.SiteVisits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Purpose</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivityRows.slice(0, 20).map((row, index) => (
                  <tr key={`${row.Email}-${row.Timestamp}-${index}`}>
                    <td className="px-4 py-2 text-sm">{row.Name}</td>
                    <td className="px-4 py-2 text-sm">{row.Email}</td>
                    <td className="px-4 py-2 text-sm">{row.Purpose}</td>
                    <td className="px-4 py-2 text-sm">{row.Location}</td>
                    <td className="px-4 py-2 text-sm">{row.Timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "movement" && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <UserMovementTracker filters={filters} />
        </div>
      )}

      {activeTab === "statehead" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select State for Engineer Attendance View
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full md:w-72 p-2 border border-gray-300 rounded-lg"
            >
              {statesAndUTs.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Engineers in {selectedState}</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                    Attendance Days (period)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {engineers.map((engineer) => (
                  <tr key={engineer.email}>
                    <td className="px-4 py-2 text-sm">{engineer.fullName}</td>
                    <td className="px-4 py-2 text-sm">{engineer.email}</td>
                    <td className="px-4 py-2 text-sm">
                      {(engineer.attendanceByDate || []).filter((a) => a.count > 0).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "mark-attendance" && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold">Mark Attendance for User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={attendanceForm.userId}
              onChange={(e) =>
                setAttendanceForm((prev) => ({ ...prev, userId: e.target.value }))
              }
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select User</option>
              {userOnlyOptions.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
            <select
              value={attendanceForm.purpose}
              onChange={(e) =>
                setAttendanceForm((prev) => ({ ...prev, purpose: e.target.value }))
              }
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="Check In">Check In</option>
              <option value="Check Out">Check Out</option>
              <option value="Site Visit">Site Visit</option>
              <option value="BSNL Office Visit">BSNL Office Visit</option>
              <option value="On Leave">On Leave</option>
              <option value="Others">Others</option>
            </select>
            {attendanceForm.purpose === "Site Visit" && (
              <select
                value={attendanceForm.subPurpose}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({ ...prev, subPurpose: e.target.value }))
                }
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Sub-Purpose</option>
                <option value="Customer End (CE)">Customer End (CE)</option>
                <option value="Tower End (TE)">Tower End (TE)</option>
              </select>
            )}
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={attendanceForm.locationLat}
              onChange={(e) =>
                setAttendanceForm((prev) => ({ ...prev, locationLat: e.target.value }))
              }
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={attendanceForm.locationLng}
              onChange={(e) =>
                setAttendanceForm((prev) => ({ ...prev, locationLng: e.target.value }))
              }
              className="p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setAttendanceForm((prev) => ({
                  ...prev,
                  imageFile: e.target.files?.[0] || null,
                }))
              }
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <textarea
            value={attendanceForm.feedback}
            onChange={(e) =>
              setAttendanceForm((prev) => ({ ...prev, feedback: e.target.value }))
            }
            placeholder="Feedback / details"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleMarkAttendance}
            disabled={markingAttendance}
            className="px-5 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
          >
            {markingAttendance ? "Submitting..." : "Mark Attendance"}
          </button>
        </div>
      )}

      {activeTab === "sites" && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <SiteAllocationManager />
        </div>
      )}

      {activeTab === "targets" && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <ExcelTargetUpload />
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <ExcelAchievementUpload />
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500">Refreshing superadmin analytics...</div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
