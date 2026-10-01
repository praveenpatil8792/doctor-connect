const steps = [

    "Register",

    "Find Doctor",

    "Book Appointment",

    "Get Treatment"

];

export default function HowItWorks() {

    return (

        <section className="py-20 bg-white">

            <div className="max-w-7xl mx-auto px-6">

                <h2 className="text-4xl font-bold text-center">

                    How It Works

                </h2>

                <div className="grid md:grid-cols-4 gap-8 mt-12">

                    {

                        steps.map((step, index) => (

                            <div

                                key={step}

                                className="text-center"

                            >

                                <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">

                                    {index + 1}

                                </div>

                                <h3 className="mt-4 text-xl font-semibold">

                                    {step}

                                </h3>

                            </div>

                        ))

                    }

                </div>

            </div>

        </section>

    );

}