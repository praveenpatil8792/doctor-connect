import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout({ children }) {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-slate-50">
                {children}
            </main>

            <Footer />
        </>
    );
}