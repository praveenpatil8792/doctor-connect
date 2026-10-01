import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import {
    getMyReviews,
    createReview,
    updateReview
} from "../services/reviewService";


export default function WriteReview() {

    const { appointmentId } = useParams();

    const navigate = useNavigate();


    const [rating, setRating] = useState(5);

    const [comment, setComment] = useState("");

    const [reviewId, setReviewId] = useState(null);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");


    /*
    =========================================
    LOAD EXISTING REVIEW
    =========================================
    */

    useEffect(() => {

        loadReview();

    }, [appointmentId]);


    const loadReview = async () => {

        try {

            setLoading(true);

            const data = await getMyReviews();

            const reviews = data.reviews || [];


            const existingReview = reviews.find(
                (review) =>
                    review.appointment?._id === appointmentId ||
                    review.appointment === appointmentId
            );


            if (existingReview) {

                setReviewId(existingReview._id);

                setRating(existingReview.rating);

                setComment(existingReview.comment || "");

            }

        } catch (err) {

            console.error(
                "Error loading review:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load review"
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    =========================================
    SUBMIT / UPDATE REVIEW
    =========================================
    */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSubmitting(true);


        try {

            const reviewData = {

                appointmentId,

                rating,

                comment

            };


            /*
            Existing review
            */

            if (reviewId) {

                await updateReview(
                    reviewId,
                    {
                        rating,
                        comment
                    }
                );

                alert(
                    "Review updated successfully"
                );

            }


            /*
            New review
            */

            else {

                await createReview(
                    reviewData
                );

                alert(
                    "Review submitted successfully"
                );

            }


            /*
            Return to appointments
            */

            navigate("/my-appointments");


        } catch (err) {

            console.error(
                "Review error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to save review"
            );

        } finally {

            setSubmitting(false);

        }

    };


    /*
    =========================================
    LOADING
    =========================================
    */

    if (loading) {

        return (

            <MainLayout>

                <div className="max-w-3xl mx-auto py-10">

                    <p>
                        Loading review...
                    </p>

                </div>

            </MainLayout>

        );

    }


    /*
    =========================================
    PAGE
    =========================================
    */

    return (

        <MainLayout>

            <div className="max-w-3xl mx-auto py-10">

                <h1 className="text-3xl font-bold mb-8">

                    {reviewId
                        ? "Edit Review"
                        : "Write Review"
                    }

                </h1>


                {error && (

                    <div className="bg-red-100 text-red-700 p-3 rounded mb-5">

                        {error}

                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    className="border rounded-xl p-6 shadow"
                >


                    {/* RATING */}

                    <div className="mb-6">

                        <label className="block font-semibold mb-3">

                            Rating

                        </label>


                        <div className="flex gap-2">

                            {[1, 2, 3, 4, 5].map(
                                (star) => (

                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                            setRating(star)
                                        }
                                        className={`text-3xl ${
                                            star <= rating
                                                ? "text-yellow-500"
                                                : "text-gray-300"
                                        }`}
                                    >

                                        ★

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* COMMENT */}

                    <div className="mb-6">

                        <label className="block font-semibold mb-2">

                            Comment

                        </label>


                        <textarea
                            value={comment}
                            onChange={(e) =>
                                setComment(e.target.value)
                            }
                            rows="5"
                            maxLength="500"
                            className="w-full border rounded-lg p-3"
                            placeholder="Write your review..."
                        />

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >

                        {submitting
                            ? "Saving..."
                            : reviewId
                                ? "Update Review"
                                : "Submit Review"
                        }

                    </button>


                </form>

            </div>

        </MainLayout>

    );

}