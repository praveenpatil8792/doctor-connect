import MainLayout from "../layouts/MainLayout";

export default function AdminDashboard() {
    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-12 px-6">
                <h1 className="text-4xl font-bold">
                    Admin Dashboard
                </h1>

                <p className="mt-4 text-gray-600">
                    Manage users, doctors and appointments.
                </p>
            </div>
        </MainLayout>
    );
}