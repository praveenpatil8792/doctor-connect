export default function Input({

    label,

    type = "text",

    placeholder,

    register,

    name,

    error

}) {

    return (

        <div className="flex flex-col gap-2">

            <label className="font-medium">

                {label}

            </label>

            <input

                type={type}

                placeholder={placeholder}

               {...register(name, {
                     required: `${label} is required`
               })}

                className="
                    border
                    rounded-lg
                    px-4
                    py-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                "
            />

            {

                error &&

                <p className="text-red-500 text-sm">

                    {error.message}

                </p>

            }

        </div>

    );

}