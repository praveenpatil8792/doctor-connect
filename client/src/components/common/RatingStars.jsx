export default function RatingStars({ rating = 0 }) {

    return (

        <div className="flex">

            {

                [...Array(5)].map((_, index) => (

                    <span key={index}>

                        {

                            index < Math.round(rating)

                                ?

                                "⭐"

                                :

                                "☆"

                        }

                    </span>

                ))

            }

        </div>

    );

}