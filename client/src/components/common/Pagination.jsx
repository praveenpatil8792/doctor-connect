export default function Pagination({

    page,

    totalPages,

    onPageChange

}) {

    return (

        <div className="flex gap-3 justify-center mt-8">

            <button

                onClick={() => onPageChange(page - 1)}

                disabled={page === 1}

            >

                Previous

            </button>

            <span>

                {page} / {totalPages}

            </span>

            <button

                onClick={() => onPageChange(page + 1)}

                disabled={page === totalPages}

            >

                Next

            </button>

        </div>

    );

}