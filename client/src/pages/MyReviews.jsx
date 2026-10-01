import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getMyReviews } from "../services/reviewService";

export default function MyReviews() {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {

            const data = await getMyReviews();

            setReviews(data.reviews || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="text-center py-20">
                    Loading reviews...
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>

            <div className="max-w-5xl mx-auto px-6 py-10">

                <h1 className="text-4xl font-bold mb-8">
                    My Reviews
                </h1>

                {reviews.length === 0 ? (

                    <div className="bg-gray-100 rounded-xl p-8 text-center">
                        You haven't written any reviews yet.
                    </div>

                ) : (

                    <div className="space-y-6">

                        {reviews.map((review) => (

                            <div
                                key={review._id}
                                className="bg-white border rounded-xl p-6 shadow-sm"
                            >

                                <h2 className="text-xl font-semibold">
                                    Dr. {review.doctor?.user?.name}
                                </h2>

                                <p className="text-blue-600">
                                    {review.doctor?.specialization}
                                </p>

                                <div className="mt-3 text-yellow-500 text-xl">
                                    {"⭐".repeat(review.rating)}
                                </div>

                                <p className="mt-4 text-gray-700">
                                    {review.comment}
                                </p>

                                <p className="mt-3 text-sm text-gray-500">
                                    {new Date(
                                        review.createdAt
                                    ).toLocaleDateString()}
                                </p>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </MainLayout>
    );
}