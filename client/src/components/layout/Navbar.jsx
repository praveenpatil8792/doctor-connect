import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, token } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-bold text-blue-600"
                >
                    DoctorConnect
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-6">

                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive
                                ? "text-blue-600 font-semibold"
                                : "hover:text-blue-600"
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/doctors"
                        className={({ isActive }) =>
                            isActive
                                ? "text-blue-600 font-semibold"
                                : "hover:text-blue-600"
                        }
                    >
                        Doctors
                    </NavLink>

                    {/* Not Logged In */}
                    {!token && (
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    isActive
                                        ? "text-blue-600 font-semibold"
                                        : "hover:text-blue-600"
                                }
                            >
                                Login
                            </NavLink>

                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    isActive
                                        ? "text-blue-600 font-semibold"
                                        : "hover:text-blue-600"
                                }
                            >
                                Register
                            </NavLink>
                        </>
                    )}

                    {/* Logged In */}
                    {token && (
                        <>
                            {/* Patient */}
                            {user?.role === "patient" && (
                                <>
                                    <NavLink
                                        to="/patient/dashboard"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "text-blue-600 font-semibold"
                                                : "hover:text-blue-600"
                                        }
                                    >
                                        Dashboard
                                    </NavLink>

                                    <NavLink
                                        to="/my-appointments"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "text-blue-600 font-semibold"
                                                : "hover:text-blue-600"
                                        }
                                    >
                                        Appointments
                                    </NavLink>

                                    <NavLink
                                        to="/my-reviews"
                                        className={({ isActive }) =>
                                            isActive
                                                ? "text-blue-600 font-semibold"
                                                : "hover:text-blue-600"
                                        }
                                    >
                                        Reviews
                                    </NavLink>
                                </>
                            )}

                            {/* Doctor */}
                            {user?.role === "doctor" && (
                                <>

                                   <NavLink
                                         to="/doctor/dashboard"
                                         className={({ isActive }) =>
                                         isActive
                                         ? "text-blue-600 font-semibold"
                                         : "hover:text-blue-600"
                                        }
                                    >
                                    Dashboard
                                   </NavLink>

                                   <NavLink
                                         to="/doctor/reviews"
                                         className={({ isActive }) =>
                                         isActive
                                         ? "text-blue-600 font-semibold"
                                         : "hover:text-blue-600"
                                        }
                                    >
                                    Reviews
                                   </NavLink>

                                   <NavLink
                                         to="/doctor/earnings"
                                         className={({ isActive }) =>
                                         isActive
                                         ? "text-blue-600 font-semibold"
                                         : "hover:text-blue-600"
                                        }
                                    >
                                    Earnings
                                   </NavLink>
                                </>
                            )}

                            {/* Admin */}
                            {user?.role === "admin" && (
                                <NavLink
                                    to="/admin/dashboard"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "text-blue-600 font-semibold"
                                            : "hover:text-blue-600"
                                    }
                                >
                                    Admin Dashboard
                                </NavLink>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}