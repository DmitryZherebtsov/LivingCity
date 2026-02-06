import { Routes, Route } from "react-router-dom";
import MapPage from "./pages/Map/MapPage";
import Header from "./components/Header/Header";
import FilterMap from "./components/Sidebar/FilterMap";

function App() {
  return (
    <>
    
      <Header />
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/test" element={<FilterMap />} />
      </Routes>

    </>
  );
}

export default App;
