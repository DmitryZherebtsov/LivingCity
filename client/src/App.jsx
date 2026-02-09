import { Routes, Route } from "react-router-dom";
import MapPage from "./pages/Map/MapPage";
import Header from "./components/Header/Header";
import FilterMap from "./components/Sidebar/FilterMap";
import Home from "./pages/Home/Home";
import EventsPage from "./pages/Event/EventsPage";

function App() {
  return (
    <>
    
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/events" element={<EventsPage />} />

        <Route path="/test" element={<FilterMap />} />
      </Routes>

    </>
  );
}

export default App;
