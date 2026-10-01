import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {

    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    const handleSearch = () => {

        navigate(`/doctors?search=${search}`);

    };

    return (

        <section className="py-12">

            <div className="max-w-5xl mx-auto">

                <div className="bg-white rounded-xl shadow-lg p-6 flex gap-4">

                    <input

                        type="text"

                        placeholder="Search doctor or specialization..."

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                        className="flex-1 border rounded-lg px-4 py-3"

                    />

                    <button

                        onClick={handleSearch}

                        className="bg-blue-600 text-white px-8 rounded-lg hover:bg-blue-700"

                    >

                        Search

                    </button>

                </div>

            </div>

        </section>

    );

}