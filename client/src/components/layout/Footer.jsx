export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">

                <div className="grid md:grid-cols-3 gap-10">

                    <div>
                        <h2 className="text-2xl font-bold text-blue-400">
                            DoctorConnect
                        </h2>

                        <p className="mt-4 text-gray-300">
                            Book appointments with trusted doctors,
                            manage your healthcare, and receive
                            quality medical services online.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">
                            Quick Links
                        </h3>

                        <ul className="space-y-2">
                            <li>Home</li>
                            <li>Doctors</li>
                            <li>Appointments</li>
                            <li>Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">
                            Contact
                        </h3>

                        <p>Email: support@doctorconnect.com</p>

                        <p>Phone: +91 9876543210</p>

                        <p>Bangalore, India</p>
                    </div>

                </div>

                <hr className="my-8 border-slate-700" />

                <p className="text-center text-gray-400">
                    © {new Date().getFullYear()} DoctorConnect.
                    All Rights Reserved.
                </p>

            </div>
        </footer>
    );
}