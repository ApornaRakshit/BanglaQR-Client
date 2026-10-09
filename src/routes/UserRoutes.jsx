import { Route } from "react-router";
import UserRoute from "../guards/UserRoute";
import UserLayout from "../layouts/UserLayout";

export default function UserRoutes() {
  return (
    <Route element={<UserRoute />}>
      <Route element={<UserLayout />}>
        {/* User domain placeholder for future phase */}
      </Route>
    </Route>
  );
}

