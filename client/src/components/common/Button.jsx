export default function Button({

    children,

    type = "button",

    onClick,

    className = "",

    disabled = false

}) {

    return (

        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                px-6
                py-3
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-medium
                transition
                duration-300
                disabled:opacity-50
                ${className}
            `}
        >
            {children}
        </button>

    );

}