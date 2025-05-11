import Hero from "@/components/views/Hero";
import Modal from "../components/detailUI/Modal";
import HeroBolivien from "@/components/views/HeroBolivien";

export default function Home() {
  return (
    <main className=" ">
      {/* <Hero /> */}
      <HeroBolivien />
      <Modal />
    </main>
  );
}
