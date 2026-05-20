import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/Sidebar_Admin";
import SiteAllocationManager from "../components/admin/SiteAllocationManager";
import ExcelTargetUpload from "../components/admin/ExcelTargetUpload";
import ExcelAchievementUpload from "../components/admin/ExcelAchievementUpload";
import EnhancedStatsDashboard from "../components/admin/EnhancedStatsDashboard";
import UserMovementTracker from "../components/admin/UserMovementTracker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import * as XLSXStyle from "xlsx-js-style";
import { toast } from "react-hot-toast";

const apiUrl = process.env.REACT_APP_API_URL || "";

const statesAndUTs = [
  "Bihar", "Delhi", "Himachal Pradesh", "Jharkhand", "Madhya Pradesh", "Rajasthan", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "all"
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayNumFromYmd = (dateStr) => {
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return "";
  return String(Number(parts[2]));
};

const weekdayShortFromYmd = (dateStr) => {
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return "";
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  const dt = new Date(y, m, d);
  return WEEKDAY_SHORT[dt.getDay()];
};

const monthlyMatrixCellClass = (val, isHolidayCol) => {
  if (isHolidayCol) return "bg-red-100/80 text-gray-600";
  switch (val) {
    case "1":
      return "bg-white";
    case "A":
      return "bg-yellow-100";
    case "L":
      return "bg-red-100";
    case "LIVE":
      return "bg-green-100 text-green-900 font-medium";
    case "EXIT":
      return "bg-red-200 text-red-900 font-medium";
    default:
      return "bg-gray-50";
  }
};

/** ARGB fills aligned with Tailwind used in the monthly table (xlsx-js-style) */
const XL = {
  header: "FFE5E7EB",
  headerHoliday: "FFFCA5A5",
  holidayCol: "FFFECACA",
  present: "FFFFFFFF",
  absent: "FFFDE047",
  leave: "FFFCA5A5",
  live: "FF86EFAC",
  exit: "FFEF4444",
  neutral: "FFE5E7EB",
  border: "FFD1D5DB",
};

const monthlyMatrixExcelFill = (val, isHolidayCol) => {
  if (isHolidayCol) return XL.holidayCol;
  switch (val) {
    case "1":
      return XL.present;
    case "A":
      return XL.absent;
    case "L":
      return XL.leave;
    case "LIVE":
      return XL.live;
    case "EXIT":
      return XL.exit;
    default:
      return XL.neutral;
  }
};

const solidFill = (rgb) => ({
  patternType: "solid",
  fgColor: { rgb },
});

const excelCellStyle = (fillRgb, opts = {}) => ({
  fill: solidFill(fillRgb),
  font: { bold: !!opts.bold, sz: opts.sz || 10 },
  alignment: { horizontal: opts.horizontal || "center", vertical: "center" },
  border: {
    top: { style: "thin", color: { rgb: XL.border } },
    bottom: { style: "thin", color: { rgb: XL.border } },
    left: { style: "thin", color: { rgb: XL.border } },
    right: { style: "thin", color: { rgb: XL.border } },
  },
});

const AdminDashboard = () => {
  const [selectedState, setSelectedState] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState("");
  const [fetchingData, setFetchingData] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Filter state for enhanced dashboard
  const [filters, setFilters] = useState({
    state: "all",
    email: "",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // New state variables for enhanced dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    topPerformers: [],
    recentActivity: [],
    stateWiseStats: {},
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    reportingManager: "",
    state: "",
    joinDate: "",
    employmentEndDate: "",
  });
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserEmail, setDeletingUserEmail] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const now = new Date();
  const [monthlyEndYear, setMonthlyEndYear] = useState(now.getFullYear());
  const [monthlyEndMonth, setMonthlyEndMonth] = useState(now.getMonth() + 1);
  const [monthlyHolidaysText, setMonthlyHolidaysText] = useState("");
  const [monthlySheetState, setMonthlySheetState] = useState("all");
  const [monthlyMatrix, setMonthlyMatrix] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  // Update filters when relevant state changes
  const updateFilters = () => {
    setFilters({
      state: selectedState || "all",
      email: searchEmail,
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  };

  // Function to export movement data to Excel
  const exportMovementDataToExcel = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    // Ensure filters are updated before export
    const currentFilters = {
      state: selectedState || "all",
      email: searchEmail,
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    if (!currentFilters.startDate || !currentFilters.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      console.log("Exporting with filters:", currentFilters);
      
      // Fetch movement data with current filters
      const params = new URLSearchParams();
      if (currentFilters.email) params.append('email', currentFilters.email);
      if (currentFilters.state && currentFilters.state !== 'all') params.append('state', currentFilters.state);
      if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);

      const apiUrl_full = `${apiUrl}/api/attendance/movement-tracking?${params}`;
      console.log("Fetching from:", apiUrl_full);

      const response = await fetch(apiUrl_full, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch data' }));
        toast.error(errorData.error || "Failed to fetch movement data");
        console.error("API Error:", errorData);
        return;
      }

      const data = await response.json();
      if (!data.success) {
        toast.error(data.error || "Failed to fetch movement data");
        return;
      }

      const movementData = data.data || [];
      console.log("Movement data received:", movementData.length, "users");
      
      if (movementData.length === 0) {
        toast.error("No movement data to export for the selected filters");
        return;
      }

      // Format data for Excel
      const excelRows = [];
      console.log("Processing movement data for Excel...");

      movementData.forEach((userData) => {
        userData.dailyMovements.forEach((day) => {
          // Get site visit times
          const siteVisitTimes = day.movements
            .filter(m => m.purpose === 'Site Visit')
            .map(m => new Date(m.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }))
            .join(', ');

          // Format check-in time
          const checkInTime = day.checkInTime 
            ? new Date(day.checkInTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : '';

          // Format check-out time
          const checkOutTime = day.checkOutTime 
            ? new Date(day.checkOutTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : '';

          // Format date
          const formattedDate = new Date(day.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });

          excelRows.push({
            'User Name': userData.userInfo.fullName,
            'Email': userData.userInfo.email,
            'State': userData.userInfo.state,
            'Phone Number': userData.userInfo.phoneNumber || '',
            'Date': formattedDate,
            'Check-In Time': checkInTime,
            'Check-Out Time': checkOutTime,
            'Site Visit Times': siteVisitTimes || 'N/A',
            'Number of Site Visits': day.siteVisits || 0,
            'Distance Travelled (km)': day.totalDistance ? day.totalDistance.toFixed(2) : '0.00'
          });
        });
      });

      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(excelRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'User Movement Data');

      // Auto-size columns
      const maxWidth = 50;
      const wscols = [
        { wch: 20 }, // User Name
        { wch: 30 }, // Email
        { wch: 20 }, // State
        { wch: 15 }, // Phone Number
        { wch: 15 }, // Date
        { wch: 15 }, // Check-In Time
        { wch: 15 }, // Check-Out Time
        { wch: 30 }, // Site Visit Times
        { wch: 20 }, // Number of Site Visits
        { wch: 20 }  // Distance Travelled
      ];
      ws['!cols'] = wscols;

      // Generate filename with date range
      const filename = `user_movement_data_${currentFilters.startDate}_to_${currentFilters.endDate}.xlsx`;
      
      console.log("Creating Excel file with", excelRows.length, "rows");
      console.log("Sample row:", excelRows[0]);
      
      // Download the file
      try {
        XLSX.writeFile(wb, filename);
        console.log("Excel file downloaded:", filename);
        toast.success(`Movement data exported successfully! ${excelRows.length} rows exported.`);
      } catch (writeError) {
        console.error("Error writing file:", writeError);
        toast.error(`Failed to write Excel file: ${writeError.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error exporting movement data:", error);
      toast.error(`Failed to export movement data: ${error.message || 'Unknown error'}`);
    }
  };

  const handleStateChange = (e) => setSelectedState(e.target.value);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const handleEmailChange = (e) => setSearchEmail(e.target.value);

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      reportingManager: user.reportingManager || "",
      state: user.state || "",
      joinDate: user.joinDate || "",
      employmentEndDate: user.employmentEndDate || "",
    });
  };

  const closeEditUserModal = () => {
    setEditingUser(null);
    setEditForm({
      fullName: "",
      phoneNumber: "",
      reportingManager: "",
      state: "",
      joinDate: "",
      employmentEndDate: "",
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateUser = async () => {
    if (!editingUser?.email) {
      toast.error("No user selected");
      return;
    }

    if (["admin", "statehead", "superadmin"].includes(editingUser.role)) {
      toast.error("Editing role-sensitive users is not allowed");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setSavingUser(true);
    try {
      const response = await fetch(`${apiUrl}/api/user/updateUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: editingUser.email,
          fullName: editForm.fullName.trim(),
          phoneNumber: editForm.phoneNumber.trim(),
          reportingManager: editForm.reportingManager.trim(),
          state: editForm.state,
          joinDate: editForm.joinDate || "",
          employmentEndDate: editForm.employmentEndDate || "",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update user");
        return;
      }

      setUsersList((prev) =>
        prev.map((u) =>
          u.email === editingUser.email ? { ...u, ...result.user } : u
        )
      );
      toast.success("User updated successfully");
      closeEditUserModal();
    } catch (updateError) {
      toast.error(updateError.message || "Failed to update user");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (email) => {
    const targetUser = usersList.find((u) => u.email === email);
    if (targetUser && ["admin", "statehead", "superadmin"].includes(targetUser.role)) {
      toast.error("Deleting role-sensitive users is not allowed");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user ${email}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setDeletingUserEmail(email);
    try {
      const response = await fetch(`${apiUrl}/api/user/deleteUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to delete user");
        return;
      }

      setUsersList((prev) => prev.filter((u) => u.email !== email));
      toast.success("User deleted successfully");
    } catch (deleteError) {
      toast.error(deleteError.message || "Failed to delete user");
    } finally {
      setDeletingUserEmail("");
    }
  };

  const fetchMonthlyAttendanceMatrix = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    setMonthlyLoading(true);
    setMonthlyMatrix(null);
    try {
      const holidayList = monthlyHolidaysText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",");
      const params = new URLSearchParams({
        endYear: String(monthlyEndYear),
        endMonth: String(monthlyEndMonth),
        holidays: holidayList,
      });
      if (monthlySheetState && monthlySheetState !== "all") {
        params.set("state", monthlySheetState);
      }
      const res = await fetch(`${apiUrl}/api/attendance/monthly-matrix?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to load monthly attendance");
        return;
      }
      setMonthlyMatrix(data);
    } catch (err) {
      toast.error(err.message || "Failed to load monthly attendance");
    } finally {
      setMonthlyLoading(false);
    }
  };

  const exportMonthlyMatrixToExcel = () => {
    if (!monthlyMatrix?.dates?.length || !monthlyMatrix?.rows?.length) {
      toast.error("Load the monthly sheet first");
      return;
    }
    const { dates, rows, cycle } = monthlyMatrix;
    const summaryHeaders = [
      "Working Days",
      "Absent",
      "Leave",
      "Present Days",
      "Paid Days",
      "% Attendance",
    ];
    const row1 = ["Sr No", "Name", "State", ...dates.map(dayNumFromYmd), ...summaryHeaders];
    const row2 = ["", "", "", ...dates.map(weekdayShortFromYmd), ...summaryHeaders.map(() => "")];
    const dataRows = rows.map((r) => [
      r.srNo,
      r.fullName,
      r.state,
      ...dates.map((d) => r.dayCells[d] ?? ""),
      r.workingDays,
      r.absent,
      r.leave,
      r.presentDays,
      r.paidDays,
      r.pctAttendance,
    ]);
    const aoa = [row1, row2, ...dataRows];
    const ws = XLSXStyle.utils.aoa_to_sheet(aoa);
    const numDates = dates.length;
    const summaryStartCol = 3 + numDates;
    const holidaySet = new Set(monthlyMatrix.holidayDates || []);

    const isHolidayDateCol = (c) => c >= 3 && c < summaryStartCol && holidaySet.has(dates[c - 3]);

    const ref = ws["!ref"];
    if (ref) {
      const range = XLSXStyle.utils.decode_range(ref);
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const addr = XLSXStyle.utils.encode_cell({ r: R, c: C });
          const cell = ws[addr];
          if (!cell) continue;

          if (R <= 1) {
            const hol = isHolidayDateCol(C);
            const fill = hol ? XL.headerHoliday : XL.header;
            cell.s = excelCellStyle(fill, {
              bold: R === 0,
              horizontal: C <= 2 ? "left" : "center",
            });
          } else {
            const rowIdx = R - 2;
            const row = rows[rowIdx];
            if (!row) continue;
            if (C <= 2) {
              cell.s = excelCellStyle(XL.present, { horizontal: C === 1 ? "left" : "center" });
            } else if (C < summaryStartCol) {
              const d = dates[C - 3];
              const hol = holidaySet.has(d);
              const val = (row.dayCells && row.dayCells[d]) ?? "";
              const fill = monthlyMatrixExcelFill(val, hol);
              cell.s = excelCellStyle(fill, { horizontal: "center" });
            } else {
              cell.s = excelCellStyle(XL.present, { horizontal: "center" });
            }
          }
        }
      }
    }

    ws["!cols"] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 16 },
      ...dates.map(() => ({ wch: 4 })),
      ...summaryHeaders.map(() => ({ wch: 12 })),
    ];
    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Attendance");
    const filename = `attendance_${cycle.start}_to_${cycle.end}.xlsx`;
    XLSXStyle.writeFile(wb, filename);
    toast.success("Excel downloaded");
  };

  // Fetch comprehensive dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user ? user.token : null;

    if (!token) {
      toast.error("No token found");
      return;
    }

    setLoading(true);
    setUsersLoading(true);
    try {
      // Fetch all users
      const usersResponse = await fetch(`${apiUrl}/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allUsers = await usersResponse.json();
      setUsersList(Array.isArray(allUsers) ? allUsers : []);

      // Fetch attendance data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const today = new Date();

      const attendanceResponse = await fetch(
        `${apiUrl}/api/attendance/filtered?startDate=${thirtyDaysAgo.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const attendanceData = await attendanceResponse.json();

      // Calculate statistics
      const totalUsers = allUsers.length;
      const activeUsers = new Set(attendanceData.map(entry => entry.user._id)).size;
      const totalAttendance = attendanceData.length;
      const averageAttendance = totalUsers > 0 ? (totalAttendance / totalUsers).toFixed(1) : 0;

      // Calculate state-wise statistics
      const stateWiseStats = {};
      allUsers.forEach(user => {
        if (!stateWiseStats[user.state]) {
          stateWiseStats[user.state] = { total: 0, active: 0 };
        }
        stateWiseStats[user.state].total++;
      });

      attendanceData.forEach(entry => {
        if (stateWiseStats[entry.user.state]) {
          stateWiseStats[entry.user.state].active++;
        }
      });

      // Get top performers (users with most attendance entries)
      const userAttendanceCount = {};
      attendanceData.forEach(entry => {
        const userId = entry.user._id;
        userAttendanceCount[userId] = (userAttendanceCount[userId] || 0) + 1;
      });

      const topPerformers = Object.entries(userAttendanceCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => {
          const user = allUsers.find(u => u._id === userId);
          return user ? { ...user, attendanceCount: count } : null;
        })
        .filter(Boolean);

      // Get recent activity (last 10 attendance entries)
      const recentActivity = attendanceData
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setDashboardStats({
        totalUsers,
        activeUsers,
        totalAttendance,
        averageAttendance,
        topPerformers,
        recentActivity,
        stateWiseStats,
        monthlyTrends: [] // Can be implemented later
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
      setUsersLoading(false);
    }
  }, []);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const fetchAttendanceData = useCallback(async () => {
    if (selectedState && startDate) {
      const startInIST = new Date(startDate);
      startInIST.setMinutes(startInIST.getMinutes() + 330); // Convert to IST

      const endInIST = endDate ? new Date(endDate) : new Date(startInIST);
      endInIST.setMinutes(endInIST.getMinutes() + 330); // Convert to IST

      const user = JSON.parse(localStorage.getItem("user")); // Get user from local storage
      const token = user ? user.token : null; // Extract token from user object

      if (!token) {
        toast.error("No token found");
        return;
      }

      setFetchingData(true);
      try {
        const stateQueryParam =
          selectedState === "all" ? "" : `state=${selectedState}&`;
        const response = await fetch(
          `${apiUrl}/api/attendance/filtered?${stateQueryParam}startDate=${startInIST
            .toISOString()
            .split("T")[0]}&endDate=${endInIST.toISOString().split("T")[0]}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setAttendanceData(data);
        } else {
          console.error("Failed to fetch attendance data:", data.error);
          toast.error("Failed to fetch attendance data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        toast.error("An error occurred while fetching attendance data");
      } finally {
        setFetchingData(false);
      }
    }
  }, [selectedState, startDate, endDate]);

  const fetchUserData = async () => {
    if (searchEmail) {
      const user = JSON.parse(localStorage.getItem("user")); // Get user from local storage
      const token = user ? user.token : null; // Extract token from user object

      if (!token) {
        toast.error("No token found");
        return;
      }

      setFetchingData(true);
      try {
        const response = await fetch(
          `${apiUrl}/api/attendance/user?email=${searchEmail}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (data.length === 0) {
            setError("User does not exist");
            setUserData([]);
            toast.error("User does not exist");
          } else {
            setError("");
            setUserData(data);
          }
        } else {
          console.error("Failed to fetch user data:", data.error);
          setError("An error occurred while fetching user data");
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        setError("An error occurred while fetching user data");
        toast.error("An error occurred while fetching user data");
      } finally {
        setFetchingData(false);
      }
    }
  };

  const convertToIST = (dateString) => {
    const date = new Date(dateString);
    const offset = 330; // IST offset in minutes
    date.setMinutes(date.getMinutes() + offset);
    return date.toISOString().replace("T", " ").substring(0, 19); // Format as YYYY-MM-DD HH:mm:ss
  };

  const downloadExcel = (data, fileName) => {
    if (data.length === 0) {
      toast.error("No data to download");
      return;
    }

    // Process data to group by user and date
    const groupedData = {};

    data.forEach((entry) => {
      const userId = entry.user.email;
      const date = convertToIST(entry.timestamp).split(" ")[0]; // Extract only the date

      // Initialize group if not already present
      if (!groupedData[userId]) {
        groupedData[userId] = {};
      }
      if (!groupedData[userId][date]) {
        groupedData[userId][date] = {
          totalDistance: entry.totalDistance || 0,
          entries: [],
        };
      }

      // Add the entry to the respective group
      groupedData[userId][date].entries.push(entry);
      groupedData[userId][date].totalDistance += entry.totalDistance || 0; // Add the distance
    });

    // Prepare rows for Excel with sequential headings
    const excelRows = [];
    Object.keys(groupedData).forEach((userId) => {
      Object.keys(groupedData[userId]).forEach((date) => {
        const group = groupedData[userId][date];
        const entries = group.entries;

        const baseRow = {
          Email: entries[0].user.email,
          Name: entries[0].user.fullName,
          State: entries[0].user.state,
          "Mobile Number": entries[0].user.phoneNumber,
          Date: date,
          "Reporting Manager": entries[0].user.reportingManager,
        };

        // Add entries as columns dynamically
        entries.forEach((entry, index) => {
          const entryNumber = index + 1;
          baseRow[`Entry ${entryNumber} - Login Time`] = convertToIST(
            entry.timestamp
          );
          baseRow[`Entry ${entryNumber} - Location Latitude`] =
            entry.location.lat;
          baseRow[`Entry ${entryNumber} - Location Longitude`] =
            entry.location.lng;
          baseRow[`Entry ${entryNumber} - Location Name`] =
            entry.locationName;
          baseRow[`Entry ${entryNumber} - Purpose`] = entry.purpose;
          baseRow[`Entry ${entryNumber} - Feedback`] = entry.feedback;
        });

        excelRows.push(baseRow);
      });
    });

    // Convert to Excel and download
    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Data");

    // Download the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast.success(`${fileName} downloaded successfully`);
  };

  useEffect(() => {
    if (selectedState && startDate) {
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, selectedState, startDate, endDate]);

  const filteredUsers = usersList.filter((u) => {
    const q = userSearchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phoneNumber || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || (u.role || "") === roleFilter;
    const matchesState = stateFilter === "all" || (u.state || "") === stateFilter;
    return matchesSearch && matchesRole && matchesState;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="md:flex ">
      <AdminSidebar />
      <div className="flex flex-col flex-grow p-4">
        
        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-2 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span>📊</span>
            <span className="hidden sm:inline">Analytics Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("movement")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "movement"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">User Movement</span>
            <span className="sm:hidden">Movement</span>
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "attendance"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span>📋</span>
            <span className="hidden sm:inline">Attendance</span>
            <span className="sm:hidden">Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab("monthlySheet")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "monthlySheet"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-600 hover:text-teal-700"
            }`}
          >
            <span>📅</span>
            <span className="hidden sm:inline">Monthly Sheet</span>
            <span className="sm:hidden">Month</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "users"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            <span>👥</span>
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Users</span>
          </button>
          <button
            onClick={() => setActiveTab("sites")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "sites"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            <span>📍</span>
            <span className="hidden sm:inline">Sites</span>
            <span className="sm:hidden">Sites</span>
          </button>
          <button
            onClick={() => setActiveTab("targets")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "targets"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            <span>🎯</span>
            <span className="hidden sm:inline">Targets</span>
            <span className="sm:hidden">Targets</span>
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-4 py-2 rounded-md transition duration-200 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "achievements"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <span>🏆</span>
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Achievements</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Global Filter Panel */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔍</span> Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/UT</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All States</option>
                    {statesAndUTs.filter(s => s !== 'all').map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select end date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={updateFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setSelectedState("all");
                    setSearchEmail("");
                    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                    setFilters({
                      state: "all",
                      email: "",
                      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Enhanced Stats Dashboard */}
            <EnhancedStatsDashboard filters={filters} />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab("movement")}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">🗺️</span>
                  <p className="text-sm font-medium text-blue-700">User Movement</p>
                </button>
                <button 
                  onClick={() => setActiveTab("attendance")}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">📋</span>
                  <p className="text-sm font-medium text-green-700">Attendance Data</p>
                </button>
                <button 
                  onClick={() => setActiveTab("targets")}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">🎯</span>
                  <p className="text-sm font-medium text-purple-700">Set Targets</p>
                </button>
                <button 
                  onClick={() => setActiveTab("achievements")}
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-200 text-center"
                >
                  <span className="text-2xl mb-2 block">🏆</span>
                  <p className="text-sm font-medium text-orange-700">Achievements</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "movement" && (
          <div className="space-y-6">
            {/* Filter Panel for Movement Tracking */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔍</span> Movement Tracking Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/UT</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All States</option>
                    {statesAndUTs.filter(s => s !== 'all').map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Select end date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={updateFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    console.log("Export button clicked");
                    exportMovementDataToExcel();
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium shadow-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Excel Report
                </button>
              </div>
            </div>

            {/* User Movement Tracker Component */}
            <UserMovementTracker filters={filters} />
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Total Users</h4>
                  <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalUsers}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-700 mb-2">Active Users</h4>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.activeUsers}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-700 mb-2">Inactive Users</h4>
                  <p className="text-2xl font-bold text-purple-600">{dashboardStats.totalUsers - dashboardStats.activeUsers}</p>
                </div>
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => setActiveTab("attendance")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  View User Details
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit or Delete Existing Users</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, email, phone"
                  className="md:col-span-2 p-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="statehead">Statehead</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={stateFilter}
                  onChange={(e) => {
                    setStateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All States</option>
                  {statesAndUTs.filter((s) => s !== "all").map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              {usersLoading ? (
                <p className="text-gray-600">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-gray-600">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Manager</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">State</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedUsers.map((u) => (
                        <tr key={u.email}>
                          <td className="px-4 py-3 text-sm text-gray-800">{u.fullName || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 capitalize">{u.role || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{u.phoneNumber || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{u.reportingManager || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{u.state || "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditUserModal(u)}
                                disabled={["admin", "statehead", "superadmin"].includes(u.role)}
                                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={["admin", "statehead", "superadmin"].includes(u.role) ? "Editing role-sensitive account is disabled" : "Edit user"}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.email)}
                                disabled={deletingUserEmail === u.email || ["admin", "statehead", "superadmin"].includes(u.role)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={["admin", "statehead", "superadmin"].includes(u.role) ? "Deleting role-sensitive account is disabled" : "Delete user"}
                              >
                                {deletingUserEmail === u.email ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * USERS_PER_PAGE + 1}-
                      {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-2 py-1 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit User: {editingUser.email}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => handleEditFieldChange("fullName", e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => handleEditFieldChange("phoneNumber", e.target.value)}
                  placeholder="Phone Number"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={editForm.reportingManager}
                  onChange={(e) => handleEditFieldChange("reportingManager", e.target.value)}
                  placeholder="Reporting Manager"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={editForm.state}
                  onChange={(e) => handleEditFieldChange("state", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select State</option>
                  {statesAndUTs.filter((s) => s !== "all").map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Join date (optional, YYYY-MM-DD — for mid-month join; leave empty to use account created date)
                  </label>
                  <input
                    type="date"
                    value={editForm.joinDate}
                    onChange={(e) => handleEditFieldChange("joinDate", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Last working day (optional — days after this show EXIT on the monthly sheet)
                  </label>
                  <input
                    type="date"
                    value={editForm.employmentEndDate}
                    onChange={(e) => handleEditFieldChange("employmentEndDate", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeEditUserModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={savingUser}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="flex flex-col md:flex-row md:mx-5 space-y-5 md:space-y-0 md:space-x-5 flex-grow">
            <div className="md:w-1/3 lg:w-2/3 w-full mb-2 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300"
                >
                  New Dashboard
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select State/UT</option>
                  {statesAndUTs.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col space-y-2">
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    dateFormat="yyyy-MM-dd"
                    className="p-2 border rounded w-full"
                    placeholderText="Select Start Date"
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    dateFormat="yyyy-MM-dd"
                    className="p-2 border rounded w-full"
                    placeholderText="Select End Date"
                  />
                </div>
                <button
                  onClick={() => downloadExcel(attendanceData, "attendance_data")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300 w-full"
                >
                  Download State Data
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter registered email"
                  className="p-2 border rounded w-full"
                />
                <button
                  onClick={fetchUserData}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full"
                >
                  Fetch User Data
                </button>
                {userData.length > 0 && (
                  <button
                    onClick={() => downloadExcel(userData, "user_data")}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300 w-full"
                  >
                    Download User Data
                  </button>
                )}
                {error && (
                  <p className="text-red-500 text-center">{error}</p>
                )}
              </div>
            </div>
            <div className="md:w-2/3 lg:w-1/3 w-full">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">Total Entries</p>
                    <p className="text-2xl font-bold text-blue-600">{attendanceData.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-700">Unique Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Set(attendanceData.map(entry => entry.user._id)).size}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-700">States Covered</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {new Set(attendanceData.map(entry => entry.user.state)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "monthlySheet" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly attendance (26th → 25th)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pick the month that <strong>ends</strong> the cycle (through the 25th). Sundays are holidays automatically.
                Add other holidays as <code className="bg-gray-100 px-1 rounded">YYYY-MM-DD</code>, separated by commas or new lines.
                Cells: <strong>1</strong> check-in, <strong>L</strong> on leave (overrides other entries that day), <strong>A</strong> absent on working days,{" "}
                <strong>LIVE</strong> before join, <strong>EXIT</strong> after last working day.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cycle ends (month)</label>
                  <select
                    value={monthlyEndMonth}
                    onChange={(e) => setMonthlyEndMonth(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={monthlyEndYear}
                    onChange={(e) => setMonthlyEndYear(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Array.from({ length: 12 }, (_, i) => now.getFullYear() - 4 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State filter</label>
                  <select
                    value={monthlySheetState}
                    onChange={(e) => setMonthlySheetState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All states</option>
                    {statesAndUTs.filter((s) => s !== "all").map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={fetchMonthlyAttendanceMatrix}
                    disabled={monthlyLoading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {monthlyLoading ? "Loading…" : "Load sheet"}
                  </button>
                  <button
                    type="button"
                    onClick={exportMonthlyMatrixToExcel}
                    disabled={!monthlyMatrix?.rows?.length}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Download Excel
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Extra holidays (dates)</label>
                <textarea
                  value={monthlyHolidaysText}
                  onChange={(e) => setMonthlyHolidaysText(e.target.value)}
                  placeholder={"2026-01-26\n2026-03-25"}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            {monthlyMatrix?.cycle && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-x-auto">
                <p className="text-sm text-gray-700 mb-3">
                  Cycle: <strong>{monthlyMatrix.cycle.start}</strong> to <strong>{monthlyMatrix.cycle.end}</strong> —{" "}
                  {monthlyMatrix.rows.length} users (role: user)
                </p>
                <div className="max-h-[70vh] overflow-auto">
                  <table className="min-w-max text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-20 bg-gray-100 border px-1 py-1 text-left">#</th>
                        <th className="sticky left-8 z-20 bg-gray-100 border px-2 py-1 text-left min-w-[120px]">Name</th>
                        <th className="sticky left-[128px] z-20 bg-gray-100 border px-2 py-1 text-left">State</th>
                        {monthlyMatrix.dates.map((d) => {
                          const isHol = monthlyMatrix.holidayDates?.includes(d);
                          return (
                            <th
                              key={d}
                              className={`border px-0.5 py-1 text-center min-w-[28px] ${isHol ? "bg-red-200" : "bg-gray-100"}`}
                            >
                              <div>{dayNumFromYmd(d)}</div>
                              <div className="font-normal text-[10px]">{weekdayShortFromYmd(d)}</div>
                            </th>
                          );
                        })}
                        <th className="border px-1 py-1 bg-gray-100">WD</th>
                        <th className="border px-1 py-1 bg-gray-100">A</th>
                        <th className="border px-1 py-1 bg-gray-100">L</th>
                        <th className="border px-1 py-1 bg-gray-100">P</th>
                        <th className="border px-1 py-1 bg-gray-100">Paid</th>
                        <th className="border px-1 py-1 bg-gray-100">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyMatrix.rows.map((r) => (
                        <tr key={r.userId}>
                          <td className="sticky left-0 z-10 bg-white border px-1 py-0.5">{r.srNo}</td>
                          <td className="sticky left-8 z-10 bg-white border px-2 py-0.5 whitespace-nowrap">{r.fullName}</td>
                          <td className="sticky left-[128px] z-10 bg-white border px-2 py-0.5">{r.state}</td>
                          {monthlyMatrix.dates.map((d) => {
                            const isHol = monthlyMatrix.holidayDates?.includes(d);
                            const v = r.dayCells[d] ?? "";
                            return (
                              <td
                                key={d}
                                className={`border text-center px-0.5 py-0.5 ${monthlyMatrixCellClass(v, isHol)}`}
                              >
                                {isHol && !v ? "" : v}
                              </td>
                            );
                          })}
                          <td className="border px-1 text-center">{r.workingDays}</td>
                          <td className="border px-1 text-center">{r.absent}</td>
                          <td className="border px-1 text-center">{r.leave}</td>
                          <td className="border px-1 text-center">{r.presentDays}</td>
                          <td className="border px-1 text-center">{r.paidDays}</td>
                          <td className="border px-1 text-center whitespace-nowrap">{r.pctAttendance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sites" && (
          <div className="flex-grow">
            <SiteAllocationManager />
          </div>
        )}

        {activeTab === "targets" && (
          <div className="flex-grow">
            <ExcelTargetUpload />
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="flex-grow">
            <ExcelAchievementUpload />
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;

