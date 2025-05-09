
import App from "./components/AtsDatePiker";
import Modal from "../components/detailUI/Modal";
import Slider from "./components/Slider";
import SliderMio from "./components/SliderMio";


export default function Home() {
  return (
    <main className="">
      {/* <Slider/> */}
      <SliderMio />
      <Modal />
    </main>
  );
}
