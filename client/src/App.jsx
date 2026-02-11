import { Routes, Route } from "react-router-dom";
import MapPage from "./pages/Map/MapPage";
import Header from "./components/Header/Header";
import FilterMap from "./components/Sidebar/FilterMap";
import Home from "./pages/Home/Home";
import EventsPage from "./pages/Events/EventsPage";
import Organizer from "./pages/Organizer/Organizer";
import About from "./pages/AboutUs/About";
import EventDetail from "./pages/EventDetail/EventDetail";

function App() {
  return (
    <>
    
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/map" element={<MapPage />} />

        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetail />} /> 

        <Route path="/organizer" element={<Organizer />} />
        <Route path="/about" element={<About />} />

        <Route path="/test" element={<FilterMap />} />
      </Routes>

    </>
  );
}

export default App;
