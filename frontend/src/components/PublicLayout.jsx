import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Chrome for public pages (home, logins, registration): the top navbar.
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
