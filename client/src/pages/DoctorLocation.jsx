import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDoctorProfile, updateHospitalLocation } from "../services/doctorService";

export default function DoctorLocation() {
    const [form, setForm] = useState({ hospital: "", address: "", city: "", state: "", pincode: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getDoctorProfile().then((data) => {
            const doctor = data.doctor;
            setForm({ hospital: doctor?.hospital || "", address: doctor?.location?.address || "", city: doctor?.location?.city || "", state: doctor?.location?.state || "", pincode: doctor?.location?.pincode || "" });
        }).catch((err) => setError(err.response?.data?.message || "Unable to load doctor profile")).finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setMessage(""); setError("");
        try {
            const data = await updateHospitalLocation(form);
            setForm({ hospital: data.doctor.hospital || "", address: data.doctor.location?.address || "", city: data.doctor.location?.city || "", state: data.doctor.location?.state || "", pincode: data.doctor.location?.pincode || "" });
            setMessage("Hospital location saved successfully. Coordinates were generated automatically.");
        } catch (err) { setError(err.response?.data?.message || "Unable to locate hospital address"); } finally { setSaving(false); }
    };

    if (loading) return <MainLayout><h2 className="text-center py-20">Loading...</h2></MainLayout>;

    return <MainLayout><div className="max-w-3xl mx-auto px-6 py-12"><h1 className="text-3xl font-bold mb-3">Hospital Location</h1><p className="text-gray-600 mb-8">Enter your hospital address. Doctor Connect will automatically find its latitude and longitude using OpenStreetMap.</p><form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow p-6 space-y-5">
        <div><label className="block font-medium mb-2">Hospital Name</label><input name="hospital" value={form.hospital} onChange={handleChange} required className="w-full border rounded-lg px-4 py-3" placeholder="Hospital name" /></div>
        <div><label className="block font-medium mb-2">Hospital Address</label><textarea name="address" value={form.address} onChange={handleChange} required rows="3" className="w-full border rounded-lg px-4 py-3" placeholder="Street, area, landmark" /></div>
        <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block font-medium mb-2">City</label><input name="city" value={form.city} onChange={handleChange} required className="w-full border rounded-lg px-4 py-3" /></div>
            <div><label className="block font-medium mb-2">State</label><input name="state" value={form.state} onChange={handleChange} required className="w-full border rounded-lg px-4 py-3" /></div>
            <div><label className="block font-medium mb-2">PIN Code</label><input name="pincode" value={form.pincode} onChange={handleChange} required className="w-full border rounded-lg px-4 py-3" /></div>
        </div>
        {message && <p className="bg-green-50 text-green-700 p-3 rounded-lg">{message}</p>}
        {error && <p className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</p>}
        <button disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60">{saving ? "Finding Hospital..." : "Save Hospital Location"}</button>
        <p className="text-xs text-gray-500">Geocoding data © OpenStreetMap contributors.</p>
    </form></div></MainLayout>;
}
