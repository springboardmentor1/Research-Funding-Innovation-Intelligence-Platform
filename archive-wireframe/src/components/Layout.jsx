import TopNavbar from "./TopNavbar";
import SideNavbar from "./SideNavbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <>
      <TopNavbar />

      <SideNavbar />

      <main className="main-content">
        {children}
      </main>

      <Footer />
    </>
  );
}

export default Layout;