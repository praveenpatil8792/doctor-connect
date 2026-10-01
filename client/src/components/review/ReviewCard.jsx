export default function ReviewCard({ review }) {

    return (

        <div className="bg-white rounded-xl shadow-md p-6">

            <div className="flex justify-between items-center">

                <div>

                    <h3 className="font-semibold text-lg">
                        {review.patient.name}
                    </h3>

                    <p className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                    </p>

                </div>

                <span className="text-yellow-500 font-bold">
                    ⭐ {review.rating}
                </span>

            </div>

            <p className="mt-4 text-gray-700 leading-7">
                {review.comment}
            </p>

        </div>

    );

}