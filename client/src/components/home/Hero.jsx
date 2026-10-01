import { Link } from "react-router-dom";

export default function Hero() {
    return (
        <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">

            <div className="max-w-7xl mx-auto px-6 py-24">

                <div className="max-w-2xl">

                    <h1 className="text-5xl font-bold leading-tight">

                        Find Trusted Doctors

                        <br />

                        Near You

                    </h1>

                    <p className="mt-6 text-lg text-blue-100">

                        Book appointments with experienced doctors,
                        manage your healthcare online and get quality
                        medical consultation anytime.

                    </p>

                    <div className="mt-10 flex gap-5">

                        <Link
                            to="/doctors"
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
                        >
                            Find Doctors
                        </Link>

                        <Link
                            to="/register"
                            className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600"
                        >
                            Register
                        </Link>

                    </div>

                </div>

            </div>

        </section>
    );
}