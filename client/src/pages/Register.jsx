import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { registerUser } from "../services/authService";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "patient",

        qualification: "",
        specialization: "",
        experience: "",
        consultationFee: "",
        hospital: "",
        about: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return alert("Passwords do not match");
        }

        try {
            const payload = { ...formData };
            delete payload.confirmPassword;

            const response = await registerUser(payload);

            alert(response.message || "Registration Successful");

            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Registration Failed"
            );
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto py-12 px-6">

                <h1 className="text-4xl font-bold text-center mb-8">
                    Register
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 bg-white shadow rounded-xl p-8"
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border rounded-lg p-3 w-full"
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border rounded-lg p-3 w-full"
                        required
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="border rounded-lg p-3 w-full"
                        required
                    />

                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="border rounded-lg p-3 w-full"
                    >
                        <option value="patient">
                            Patient
                        </option>

                        <option value="doctor">
                            Doctor
                        </option>
                    </select>

                    {formData.role === "doctor" && (
                        <div className="space-y-4 border rounded-lg p-5 bg-gray-50">

                            <h2 className="text-xl font-semibold">
                                Doctor Information
                            </h2>

                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                className="border rounded-lg p-3 w-full"
                                required
                            >
                                <option value="">
                                    Select Specialization
                                </option>

                                <option value="General Physician">
                                    General Physician
                                </option>

                                <option value="Cardiologist">
                                    Cardiologist
                                </option>

                                <option value="Dermatologist">
                                    Dermatologist
                                </option>

                                <option value="Dentist">
                                    Dentist
                                </option>

                                <option value="Neurologist">
                                    Neurologist
                                </option>

                                <option value="Orthopedic">
                                    Orthopedic
                                </option>

                                <option value="Pediatrician">
                                    Pediatrician
                                </option>

                                <option value="Gynecologist">
                                    Gynecologist
                                </option>

                                <option value="Psychiatrist">
                                    Psychiatrist
                                </option>

                                <option value="ENT Specialist">
                                    ENT Specialist
                                </option>

                                <option value="Ophthalmologist">
                                    Ophthalmologist
                                </option>

                                <option value="Others">
                                    Others
                                </option>
                            </select>

                            <input
                                type="text"
                                name="qualification"
                                placeholder="Qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                className="border rounded-lg p-3 w-full"
                                required
                            />

                            <input
                                type="number"
                                name="experience"
                                placeholder="Experience (Years)"
                                value={formData.experience}
                                onChange={handleChange}
                                className="border rounded-lg p-3 w-full"
                                required
                            />

                            <input
                                type="number"
                                name="consultationFee"
                                placeholder="Consultation Fee"
                                value={formData.consultationFee}
                                onChange={handleChange}
                                className="border rounded-lg p-3 w-full"
                                required
                            />

                            <input
                                type="text"
                                name="hospital"
                                placeholder="Hospital"
                                value={formData.hospital}
                                onChange={handleChange}
                                className="border rounded-lg p-3 w-full"
                                required
                            />

                            <textarea
                                name="about"
                                placeholder="About Yourself"
                                value={formData.about}
                                onChange={handleChange}
                                rows={4}
                                className="border rounded-lg p-3 w-full"
                            />
                        </div>
                    )}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="border rounded-lg p-3 w-full"
                        required
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="border rounded-lg p-3 w-full"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg"
                    >
                        Register
                    </button>

                    <p className="text-center">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-blue-600"
                        >
                            Login
                        </Link>
                    </p>
                </form>

            </div>
        </MainLayout>
    );
}