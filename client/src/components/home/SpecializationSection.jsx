import { useNavigate } from "react-router-dom";

const specializations = [
    {
        name: "Cardiologist",
        icon: "❤️",
    },
    {
        name: "Neurologist",
        icon: "🧠",
    },
    {
        name: "Orthopedic",
        icon: "🦴",
    },
    {
        name: "Dermatologist",
        icon: "🌿",
    },
    {
        name: "Dentist",
        icon: "🦷",
    },
    {
        name: "Pediatrics",
        icon: "👶",
    },
];

export default function SpecializationSection() {

    const navigate = useNavigate();

    const handleClick = (specialization) => {
        navigate(`/doctors?specialization=${specialization}`);
    };

    return (
        <section className="py-16">

            <div className="max-w-7xl mx-auto px-6">

                <h2 className="text-4xl font-bold text-center">
                    Browse by Specialization
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-12">

                    {specializations.map((item) => (

                        <div
                            key={item.name}
                            onClick={() => handleClick(item.name)}
                            className="
                                bg-white
                                rounded-xl
                                shadow
                                hover:shadow-xl
                                transition
                                p-8
                                text-center
                                cursor-pointer
                            "
                        >
                            <div className="text-5xl">
                                {item.icon}
                            </div>

                            <p className="mt-4 font-semibold">
                                {item.name}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}