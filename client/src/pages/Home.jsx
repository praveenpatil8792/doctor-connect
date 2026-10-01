import MainLayout from "../layouts/MainLayout";

import Hero from "../components/home/Hero";
import SearchBar from "../components/home/SearchBar";
import SpecializationSection from "../components/home/SpecializationSection";
import HowItWorks from "../components/home/HowItWorks";

export default function Home() {

    return (

        <MainLayout>

            <Hero />

            <SearchBar />

            <SpecializationSection />

            <HowItWorks />

        </MainLayout>

    );

}