import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDoctorReviews } from "../services/reviewService";

export default function DoctorReviews() {

    const [reviews, setReviews] = useState([]);

    const [averageRating, setAverageRating] = useState(0);

    const [totalReviews, setTotalReviews] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {

        try {

            const data = await getDoctorReviews();

            setReviews(data.reviews || []);

            setAverageRating(data.averageRating || 0);

            setTotalReviews(data.totalReviews || 0);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const renderStars = (rating) => {

        return (
            <div className="flex gap-1">

                {[1, 2, 3, 4, 5].map((star) => (

                    <span
                        key={star}
                        className={
                            star <= rating
                                ? "text-yellow-400 text-xl"
                                : "text-gray-300 text-xl"
                        }
                    >
                        ★
                    </span>

                ))}

            </div>
        );

    };

    if (loading) {

        return (

            <MainLayout>

                <div className="max-w-5xl mx-auto py-12">

                    <p>Loading reviews...</p>

                </div>

            </MainLayout>

        );

    }

    return (

        <MainLayout>

            <div className="max-w-5xl mx-auto py-12 px-4">

                <h1 className="text-4xl font-bold mb-8">
                    My Reviews
                </h1>

                {/* Rating Summary */}

                <div className="border rounded-xl p-6 mb-8 bg-white">

                    <h2 className="text-xl font-semibold mb-4">
                        Rating Summary
                    </h2>

                    <div className="flex items-center gap-6">

                        <div>

                            <p className="text-5xl font-bold">
                                {averageRating.toFixed(1)}
                            </p>

                            {renderStars(
                                Math.round(averageRating)
                            )}

                        </div>

                        <div>

                            <p className="text-gray-600">
                                Total Reviews
                            </p>

                            <p className="text-2xl font-semibold">
                                {totalReviews}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Reviews */}

                <h2 className="text-2xl font-bold mb-5">
                    Patient Reviews
                </h2>

                {reviews.length === 0 ? (

                    <div className="border rounded-xl p-8 text-center">

                        <p className="text-gray-500">
                            No reviews yet.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {reviews.map((review) => (

                            <div
                                key={review._id}
                                className="border rounded-xl p-6 bg-white"
                            >

                                <div className="flex justify-between items-start">

                                    <div>

                                        <h3 className="text-lg font-semibold">
                                            {review.patient?.name ||
                                                "Patient"}
                                        </h3>

                                        {renderStars(
                                            review.rating
                                        )}

                                    </div>

                                    <span className="text-sm text-gray-500">

                                        {new Date(
                                            review.createdAt
                                        ).toLocaleDateString()}

                                    </span>

                                </div>

                                <p className="mt-4 text-gray-700">
                                    {review.comment}
                                </p>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </MainLayout>

    );

}