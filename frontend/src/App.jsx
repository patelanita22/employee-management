import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8081/employees";

const EMPTY_EMPLOYEE = {
  name: "",
  email: "",
  department: "",
  salary: "",
};

const EMPTY_LEAVE = {
  employee: "",
  type: "Casual Leave",
  from: "",
  to: "",
  reason: "",
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState(EMPTY_EMPLOYEE);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All Departments");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  // Leave Management
  const [showLeaveManagement, setShowLeaveManagement] =
    useState(false);


    // Department Management
const [showDepartmentManagement, setShowDepartmentManagement] =
  useState(false);

  const [leaves, setLeaves] = useState([
    {showLeaveManagement
    },
    {
      
      id: 1,
      employee: "Anita",
      type: "Casual Leave",
      from: "2026-08-15",
      to: "2026-08-16",
      reason: "Personal work",
      status: "Pending",
    },
    {
      id: 2,
      employee: "Rahul",
      type: "Sick Leave",
      from: "2026-08-18",
      to: "2026-08-18",
      reason: "Not feeling well",
      status: "Approved",
    },
  ]);

  const [newLeave, setNewLeave] = useState(EMPTY_LEAVE);

  /* =========================
     LOAD EMPLOYEES
  ========================= */

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* =========================
     EMPLOYEE STATUS
  ========================= */

  const getEmployeeStatus = (id) => {
    const statuses = {
      1: "Active",
      2: "On Leave",
      3: "Inactive",
      4: "Active",
      5: "On Leave",
      6: "Active",
      7: "Inactive",
    };

    return statuses[id] || "Active";
  };

  /* =========================
     EMPLOYEE ROLE
  ========================= */

  const getEmployeeRole = (department) => {
    const roles = {
      DevOps: "DevOps Engineer",
      QA: "QA Engineer",
      Cloud: "Cloud Engineer",
      Development: "Software Engineer",
      HR: "HR Executive",
      Finance: "Finance Executive",
    };

    return roles[department] || "Employee";
  };

  /* =========================
     DEPARTMENTS
  ========================= */

  const departments = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((employee) => employee.department)
          .filter(Boolean)
      ),
    ];
  }, [employees]);

  /* =========================
     FILTER EMPLOYEES
  ========================= */

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const status = getEmployeeStatus(employee.id);
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        employee.name?.toLowerCase().includes(searchText) ||
        employee.email?.toLowerCase().includes(searchText) ||
        employee.department
          ?.toLowerCase()
          .includes(searchText);

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    employees,
    search,
    departmentFilter,
    statusFilter,
  ]);

  /* =========================
     DASHBOARD COUNTS
  ========================= */

  const activeCount = employees.filter(
    (employee) =>
      getEmployeeStatus(employee.id) === "Active"
  ).length;

  const leaveCount = employees.filter(
    (employee) =>
      getEmployeeStatus(employee.id) === "On Leave"
  ).length;

  const inactiveCount = employees.filter(
    (employee) =>
      getEmployeeStatus(employee.id) === "Inactive"
  ).length;

  /* =========================
     ADD EMPLOYEE
  ========================= */

  const openAddForm = () => {
    setEditingEmployee(null);
    setNewEmployee({ ...EMPTY_EMPLOYEE });
    setError("");
    setShowAddForm(true);
  };

  /* =========================
     CLOSE EMPLOYEE FORM
  ========================= */

  const closeForm = () => {
    if (saving) return;

    setShowAddForm(false);
    setEditingEmployee(null);
    setNewEmployee({ ...EMPTY_EMPLOYEE });
    setError("");
  };

  /* =========================
     EMPLOYEE INPUT
  ========================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     ADD / EDIT EMPLOYEE
  ========================= */

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    if (
      !newEmployee.name.trim() ||
      !newEmployee.email.trim() ||
      !newEmployee.department.trim() ||
      !newEmployee.salary
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingEmployee);

      const url = isEditing
        ? `${API_URL}/${editingEmployee.id}`
        : API_URL;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newEmployee.name.trim(),
          email: newEmployee.email.trim(),
          department: newEmployee.department.trim(),
          salary: Number(newEmployee.salary),
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? "Failed to update employee"
            : "Failed to add employee"
        );
      }

      const savedEmployee = await response.json();

      if (isEditing) {
        setEmployees((prev) =>
          prev.map((employee) =>
            employee.id === savedEmployee.id
              ? savedEmployee
              : employee
          )
        );
      } else {
        setEmployees((prev) => [
          ...prev,
          savedEmployee,
        ]);
      }

      closeForm();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     EDIT EMPLOYEE
  ========================= */

  const handleEdit = (employee) => {
    setEditingEmployee(employee);

    setNewEmployee({
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      salary: employee.salary || "",
    });

    setError("");
    setShowAddForm(true);
  };

  /* =========================
     DELETE EMPLOYEE
  ========================= */

  const handleDelete = async (id) => {
    const employee = employees.find(
      (item) => item.id === id
    );

    if (!employee) return;

    const confirmed = window.confirm(
      `Delete ${employee.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      setEmployees((prev) =>
        prev.filter(
          (employee) => employee.id !== id
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  /* =========================
     FILTERS
  ========================= */

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("All Departments");
    setStatusFilter("All Status");
  };

  const hasFilters =
    search ||
    departmentFilter !== "All Departments" ||
    statusFilter !== "All Status";

  /* =========================
     LEAVE FUNCTIONS
  ========================= */

  const openLeaveManagement = () => {
    setShowLeaveManagement(true);
    setError("");
  };

  const closeLeaveManagement = () => {
    setShowLeaveManagement(false);
    setError("");
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;

    setNewLeave((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();

    if (
      !newLeave.employee.trim() ||
      !newLeave.from ||
      !newLeave.to
    ) {
      alert(
        "Please fill Employee, From Date and To Date"
      );
      return;
    }

    if (newLeave.to < newLeave.from) {
      alert(
        "To Date cannot be earlier than From Date"
      );
      return;
    }

    const leave = {
      id: Date.now(),
      employee: newLeave.employee.trim(),
      type: newLeave.type,
      from: newLeave.from,
      to: newLeave.to,
      reason: newLeave.reason.trim(),
      status: "Pending",
    };

    setLeaves((prev) => [...prev, leave]);
    setNewLeave({ ...EMPTY_LEAVE });
  };

  const approveLeave = (id) => {
    setLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id
          ? { ...leave, status: "Approved" }
          : leave
      )
    );
  };

  const rejectLeave = (id) => {
    setLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id
          ? { ...leave, status: "Rejected" }
          : leave
      )
    );
  };

  const deleteLeave = (id) => {
    setLeaves((prev) =>
      prev.filter((leave) => leave.id !== id)
    );
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">👥</div>

          <div>
            <h2>EmployeeHub</h2>
            <p>Management System</p>
          </div>
        </div>

        <nav className="sidebar-nav">

          <div className="menu-label">
            MAIN MENU
          </div>

          <button
            type="button"
            className={`menu-item ${
              !showLeaveManagement ? "active" : ""
            }`}
            onClick={closeLeaveManagement}
          >
            <span className="menu-icon">⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className="add-button"
            onClick={openAddForm}
          >
            <span>+</span>
            Add Employee
          </button>

          <button
  type="button"
  className={`menu-item ${
    showDepartmentManagement ? "active" : ""
  }`}
  onClick={() => {
    setShowDepartmentManagement(true);
    setShowLeaveManagement(false);
  }}
>
  <span className="menu-icon">▦</span>
  Departments
</button>

          <button
            type="button"
            className={`menu-item ${
              showLeaveManagement ? "active" : ""
            }`}
            onClick={() => {
  openLeaveManagement();
  setShowDepartmentManagement(false);
}}
          >
            <span className="menu-icon">▣</span>
            Leave Management
          </button>

          <button
            type="button"
            className="menu-item"
          >
            <span className="menu-icon">▥</span>
            Reports
          </button>

          <button
            type="button"
            className="menu-item"
          >
            <span className="menu-icon">◷</span>
            Attendance
          </button>

          <div className="menu-label system-label">
            SYSTEM
          </div>

          <button
            type="button"
            className="menu-item"
          >
            <span className="menu-icon">⚙</span>
            Settings
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="admin-profile">

            <img
              src="https://i.pravatar.cc/100?img=47"
              alt="Admin"
            />

            <div className="admin-info">
              <strong>Prisha</strong>
              <span>Administrator</span>
            </div>

            <span className="arrow">⌄</span>

          </div>

          <div className="help-card">

            <div className="help-icon">?</div>

            <div>
              <strong>Need Help?</strong>
              <span>
                Contact administrator
              </span>
            </div>

            <b>→</b>

          </div>

        </div>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main">

        <header className="top-header">

          <button
            type="button"
            className="mobile-menu"
          >
            ☰
          </button>

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="header-right">

            <button
              type="button"
              className="notification"
            >
              ♧
              <span className="notification-count">
                3
              </span>
            </button>

            <div className="header-profile">

              <img
                src="https://i.pravatar.cc/100?img=47"
                alt="Admin"
              />

              <div>
                <strong>Prisha</strong>
                <span>Administrator</span>
              </div>

              <b>⌄</b>

            </div>

          </div>

        </header>

        <div className="content">

  {showDepartmentManagement ? (

    <section className="employees-section">

      <div className="employees-header">

        <div>
          <h2>Departments</h2>
          <p>Manage all departments in your organization.</p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={() => setShowDepartmentManagement(false)}
        >
          ← Dashboard
        </button>

      </div>

      <div className="stats-grid">

        {departments.map((department) => {

          const count = employees.filter(
            (employee) =>
              employee.department === department
          ).length;

          return (
            <div
              className="stat-card"
              key={department}
            >

              <div className="stat-icon purple-icon">
                ▦
              </div>

              <div className="stat-content">

                <span>
                  {department}
                </span>

                <h2>
                  {count}
                </h2>

                <small className="growth">
                  {count === 1
                    ? "1 Employee"
                    : `${count} Employees`}
                </small>

              </div>

            </div>
          );

        })}

      </div>

      <div className="employees-section">

        <div className="employees-header">

          <div>
            <h2>Department Employees</h2>
            <p>
              Employees grouped by department.
            </p>
          </div>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>EMAIL</th>
                <th>DEPARTMENT</th>
                <th>ROLE</th>
                <th>SALARY</th>
              </tr>
            </thead>

            <tbody>

              {employees.map((employee) => (

                <tr key={employee.id}>

                  <td>
                    <div className="employee-cell">

                      <img
                        src={`https://i.pravatar.cc/100?img=${
                          employee.id + 10
                        }`}
                        alt={employee.name}
                        className="employee-avatar"
                      />

                      <div className="employee-info">

                        <strong>
                          {employee.name}
                        </strong>

                      </div>

                    </div>
                  </td>

                  <td>
                    {employee.email}
                  </td>

                  <td>
                    <span className="department">
                      {employee.department}
                    </span>
                  </td>

                  <td>
                    <span className="role">
                      {getEmployeeRole(
                        employee.department
                      )}
                    </span>
                  </td>

                  <td>
                    ₹
                    {Number(
                      employee.salary
                    ).toLocaleString("en-IN")}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </section>

  ) : showLeaveManagement ? (

            <section className="employees-section">

              <div className="employees-header">

                <div>
                  <h2>Leave Management</h2>
                  <p>
                    Manage employee leave requests.
                  </p>
                </div>

                <button
                  type="button"
                  className="add-button"
                  onClick={closeLeaveManagement}
                >
                  ← Dashboard
                </button>

              </div>

              {/* APPLY LEAVE */}

              <div
                style={{
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}
              >

                <h3>Apply Leave</h3>

                <form
                  onSubmit={handleLeaveSubmit}
                >

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, 1fr)",
                      gap: "15px",
                      marginTop: "15px",
                    }}
                  >

                    <input
                      type="text"
                      name="employee"
                      placeholder="Employee Name"
                      value={newLeave.employee}
                      onChange={handleLeaveChange}
                      required
                    />

                    <select
                      name="type"
                      value={newLeave.type}
                      onChange={handleLeaveChange}
                    >
                      <option>
                        Casual Leave
                      </option>
                      <option>
                        Sick Leave
                      </option>
                      <option>
                        Annual Leave
                      </option>
                      <option>
                        Emergency Leave
                      </option>
                    </select>

                    <input
                      type="date"
                      name="from"
                      value={newLeave.from}
                      onChange={handleLeaveChange}
                      required
                    />

                    <input
                      type="date"
                      name="to"
                      value={newLeave.to}
                      onChange={handleLeaveChange}
                      required
                    />

                    <input
                      type="text"
                      name="reason"
                      placeholder="Reason"
                      value={newLeave.reason}
                      onChange={handleLeaveChange}
                      style={{
                        gridColumn: "1 / -1",
                      }}
                    />

                  </div>

                  <button
                    type="submit"
                    className="add-button"
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    + Apply Leave
                  </button>

                </form>

              </div>

              {/* LEAVE TABLE */}

              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "auto",
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >

                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {leaves.length === 0 ? (

                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "30px",
                          }}
                        >
                          No leave requests found.
                        </td>
                      </tr>

                    ) : (

                      leaves.map((leave) => (

                        <tr key={leave.id}>

                          <td>
                            {leave.employee}
                          </td>

                          <td>
                            {leave.type}
                          </td>

                          <td>
                            {leave.from}
                          </td>

                          <td>
                            {leave.to}
                          </td>

                          <td>
                            {leave.reason || "-"}
                          </td>

                          <td>
                            <strong>
                              {leave.status}
                            </strong>
                          </td>

                          <td>

                            {leave.status ===
                              "Pending" ? (

                              <>

                                <button
                                  type="button"
                                  onClick={() =>
                                    approveLeave(
                                      leave.id
                                    )
                                  }
                                  style={{
                                    marginRight:
                                      "8px",
                                  }}
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    rejectLeave(
                                      leave.id
                                    )
                                  }
                                >
                                  Reject
                                </button>

                              </>

                            ) : (

                              <button
                                type="button"
                                onClick={() =>
                                  deleteLeave(
                                    leave.id
                                  )
                                }
                              >
                                Delete
                              </button>

                            )}

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            </section>

          ) : (

            /* =========================
               DASHBOARD
            ========================= */

            <>

              <div className="page-heading">

                <div>
                  <h1>
                    Employee Dashboard
                  </h1>

                  <p>
                    Manage and view all employees
                    in your organization.
                  </p>
                </div>

                <div className="date-box">

                  <span>Today</span>

                  <strong>
                    {new Date().toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </strong>

                </div>

              </div>

              {/* STAT CARDS */}

              <section className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon purple-icon">
                    👥
                  </div>

                  <div className="stat-content">
                    <span>
                      Total Employees
                    </span>

                    <h2>
                      {employees.length}
                    </h2>

                    <small className="growth">
                      All employees
                    </small>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon green-icon">
                    ✓
                  </div>

                  <div className="stat-content">
                    <span>
                      Active Employees
                    </span>

                    <h2>
                      {activeCount}
                    </h2>

                    <small className="growth green-text">
                      Currently active
                    </small>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon orange-icon">
                    ☀
                  </div>

                  <div className="stat-content">
                    <span>
                      On Leave
                    </span>

                    <h2>
                      {leaveCount}
                    </h2>

                    <small className="growth orange-text">
                      Currently on leave
                    </small>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon red-icon">
                    ◉
                  </div>

                  <div className="stat-content">
                    <span>
                      Inactive Employees
                    </span>

                    <h2>
                      {inactiveCount}
                    </h2>

                    <small className="growth red-text">
                      Currently inactive
                    </small>
                  </div>

                </div>

              </section>

              {/* EMPLOYEE SECTION */}

              <section className="employees-section">

                <div className="employees-header">

                  <div>
                    <h2>
                      All Employees
                    </h2>

                    <p>
                      Manage and view all employees
                      in your organization.
                    </p>
                  </div>

                  <div className="table-actions">

                    <button
                      type="button"
                      className="filter-button"
                      onClick={clearFilters}
                      disabled={!hasFilters}
                    >
                      ⚱ Clear Filters
                    </button>

                    <select
                      className="select-button"
                      value={
                        departmentFilter
                      }
                      onChange={(e) =>
                        setDepartmentFilter(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        All Departments
                      </option>

                      {departments.map(
                        (department) => (
                          <option
                            key={department}
                            value={department}
                          >
                            {department}
                          </option>
                        )
                      )}

                    </select>

                    <select
                      className="select-button"
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        All Status
                      </option>

                      <option>
                        Active
                      </option>

                      <option>
                        On Leave
                      </option>

                      <option>
                        Inactive
                      </option>

                    </select>

                  </div>

                </div>

                {/* EMPLOYEE TABLE */}

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>
                        <th>EMPLOYEE</th>
                        <th>DEPARTMENT</th>
                        <th>ROLE</th>
                        <th>STATUS</th>
                        <th>SALARY</th>
                        <th>ACTIONS</th>
                      </tr>

                    </thead>

                    <tbody>

                      {loading && (
                        <tr>
                          <td
                            colSpan="6"
                            className="loading"
                          >
                            Loading employees...
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        filteredEmployees.length ===
                          0 && (
                          <tr>
                            <td
                              colSpan="6"
                              className="loading"
                            >
                              No employees found.
                            </td>
                          </tr>
                        )}

                      {!loading &&
                        filteredEmployees.map(
                          (employee) => {

                            const status =
                              getEmployeeStatus(
                                employee.id
                              );

                            return (
                              <tr
                                key={employee.id}
                              >

                                <td>

                                  <div className="employee-cell">

                                    <img
                                      src={`https://i.pravatar.cc/100?img=${
                                        employee.id + 10
                                      }`}
                                      alt={
                                        employee.name
                                      }
                                      className="employee-avatar"
                                    />

                                    <div className="employee-info">

                                      <strong>
                                        {
                                          employee.name
                                        }
                                      </strong>

                                      <span>
                                        {
                                          employee.email
                                        }
                                      </span>

                                    </div>

                                  </div>

                                </td>

                                <td>
                                  <span className="department">
                                    {
                                      employee.department
                                    }
                                  </span>
                                </td>

                                <td>
                                  <span className="role">
                                    {getEmployeeRole(
                                      employee.department
                                    )}
                                  </span>
                                </td>

                                <td>

                                  <span
                                    className={`status status-${status
                                      .toLowerCase()
                                      .replace(
                                        " ",
                                        "-"
                                      )}`}
                                  >
                                    <i></i>
                                    {status}
                                  </span>

                                </td>

                                <td>
                                  <span className="joined">
                                    ₹
                                    {Number(
                                      employee.salary
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                </td>

                                <td>

                                  <div className="actions">

                                    <button
                                      type="button"
                                      className="edit-button"
                                      onClick={() =>
                                        handleEdit(
                                          employee
                                        )
                                      }
                                      title="Edit employee"
                                    >
                                      ✎
                                    </button>

                                    <button
                                      type="button"
                                      className="delete-button"
                                      onClick={() =>
                                        handleDelete(
                                          employee.id
                                        )
                                      }
                                      title="Delete employee"
                                    >
                                      🗑
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )}

                    </tbody>

                  </table>

                </div>

                <div className="table-footer">

                  <span>
                    Showing{" "}
                    <strong>
                      {filteredEmployees.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {employees.length}
                    </strong>{" "}
                    employees
                  </span>

                </div>

              </section>

            </>

          )}

        </div>

      </main>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showAddForm && (

        <div
          className="add-form-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >

          <form
            className="add-form"
            onSubmit={handleEmployeeSubmit}
          >

            <div className="form-header">

              <div>

                <h2>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p>
                  {editingEmployee
                    ? "Update employee information"
                    : "Enter employee information"}
                </p>

              </div>

              <button
                type="button"
                className="form-close"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={newEmployee.name}
              onChange={handleInputChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={newEmployee.email}
              onChange={handleInputChange}
              required
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={newEmployee.department}
              onChange={handleInputChange}
              required
            />

            <input
              type="number"
              name="salary"
              placeholder="Salary"
              min="0"
              value={newEmployee.salary}
              onChange={handleInputChange}
              required
            />

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-buttons">

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingEmployee
                  ? "Update Employee"
                  : "Save Employee"}
              </button>

            </div>

          </form>

        </div>

      )}

    </div>
  );
}

export default App;