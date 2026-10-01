import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Doctors from "../pages/Doctors";
import DoctorDetails from "../pages/DoctorDetails";
import BookAppointment from "../pages/BookAppointment";
import MyAppointments from "../pages/MyAppointments";

import PatientDashboard from "../dashboard/PatientDashboard";
import DoctorDashboard from "../dashboard/DoctorDashboard";
import AdminDashboard from "../dashboard/AdminDashboard";
import Availability from "../pages/Availability";

import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";
import WriteReview from "../pages/WriteReview";
import MyReviews from "../pages/MyReviews";
import DoctorReviews from "../pages/DoctorReviews";
import DoctorEarnings from "../pages/DoctorEarnings";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route
                 path="/doctor/:id"
                 element={<DoctorDetails />}
            />
            <Route
                 element={
                    <ProtectedRoute
                       allowedRoles={["patient"]}
                    />
                }
            >
                <Route
                     path="/book/:id"
                     element={<BookAppointment />}
                />

                <Route
                     path="/patient/dashboard"
                     element={<PatientDashboard />}
                />

                <Route
                     path="/my-appointments"
                     element={<MyAppointments />}
                />

                <Route
                     path="/review/:appointmentId"
                     element={<WriteReview />}
                />

                 <Route
                     path="/my-reviews"
                     element={<MyReviews />}
                 />
            </Route>
            <Route
                 element={
                      <ProtectedRoute
                           allowedRoles={["doctor"]}
                      />
                }
            >
            <Route
                  path="/doctor/dashboard"
                  element={<DoctorDashboard />}
            />
            <Route
                  path="/doctor/reviews"
                  element={<DoctorReviews />}
            />

            <Route
                  path="/doctor/earnings"
                  element={<DoctorEarnings />}
            />
            <Route
                  path="/doctor/availability"
                  element={<Availability />}
            />
            </Route>
            <Route
                 element={
                    <ProtectedRoute
                    allowedRoles={["admin"]}
                    />
                }
            >
            <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
            />
           </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}