import { Route } from "react-router";
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";

export default function PublicRoutes() {
  return (
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
    </Route>
  );
}

