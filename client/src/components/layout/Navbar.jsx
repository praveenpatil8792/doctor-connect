import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { getDoctorProfile } from "../../services/doctorService";

export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const { user, token } = useSelector((state) => state.auth);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        if (!token || user?.role !== "doctor") { setDoctorProfile(null); return; }
        getDoctorProfile().then((data) => setDoctorProfile(data.doctor)).catch(() => setDoctorProfile(null));
    }, [token, user?.role]);

    useEffect(() => {
        const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setProfileOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const handleLogout = () => { setProfileOpen(false); dispatch(logout()); navigate("/login"); };
    const doctorName = doctorProfile?.user?.name || user?.name || "Doctor";
    const initials = doctorName.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join("") || "DR";
    const profileImage = doctorProfile?.user?.profileImage?.url || "";

    return <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">DoctorConnect</Link>
            <div className="flex items-center gap-6">
                <NavLink to="/" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Home</NavLink>
                <NavLink to="/doctors" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Doctors</NavLink>
                {!token && <>
                    <NavLink to="/login" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Login</NavLink>
                    <NavLink to="/register" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Register</NavLink>
                </>}
                {token && user?.role === "patient" && <>
                    <NavLink to="/patient/dashboard" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Dashboard</NavLink>
                    <NavLink to="/my-appointments" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Appointments</NavLink>
                    <NavLink to="/my-reviews" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Reviews</NavLink>
                </>}
                {token && user?.role === "doctor" && <>
                    <NavLink to="/doctor/dashboard" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Dashboard</NavLink>
                    <NavLink to="/doctor/reviews" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Reviews</NavLink>
                    <NavLink to="/doctor/earnings" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Earnings</NavLink>
                    <div className="relative ml-2" ref={menuRef}>
                        <button type="button" onClick={() => setProfileOpen((x) => !x)} className="flex items-center gap-2 rounded-full focus:outline-none" title="Doctor profile menu">
                            {profileImage ? <img src={profileImage} alt={doctorName} className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" /> : <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold border-2 border-blue-200">{initials}</span>}
                            <span className="text-gray-500 text-sm">⌄</span>
                        </button>
                        {profileOpen && <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="px-4 py-4 border-b bg-gray-50"><p className="font-semibold">{doctorName}</p><p className="text-sm text-gray-500 truncate">{doctorProfile?.user?.email || "Doctor account"}</p></div>
                            {[['Profile','/doctor/profile'],['Doctor Availability & Appointment','/doctor/availability'],['Hospital Location','/doctor/location']].map(([label,path]) => <button key={path} type="button" onClick={() => {setProfileOpen(false); navigate(path);}} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700">{label}</button>)}
                            <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-3 border-t text-red-600 hover:bg-red-50">Logout</button>
                        </div>}
                    </div>
                </>}
                {token && user?.role === "admin" && <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}>Admin Dashboard</NavLink>}
                {token && user?.role !== "doctor" && <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>}
            </div>
        </div>
    </nav>;
}
