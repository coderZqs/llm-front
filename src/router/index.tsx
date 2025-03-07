import { Routes, Route, } from "react-router-dom";
import Home from "../pages/home/index";

function Router() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default Router;
