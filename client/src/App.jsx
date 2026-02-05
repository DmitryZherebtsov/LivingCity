import { Routes, Route } from "react-router-dom";
import MapPage from "./pages/Map/MapPage";
import Header from "./components/Header/Header";

function App() {
  return (
    <>
    
      <Header />
      <Routes>
        <Route path="/" element={<MapPage />} />
      </Routes>

    </>
  );
}

export default App;
