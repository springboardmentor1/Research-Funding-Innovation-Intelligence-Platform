import TopNavbar from "../components/TopNavbar";
import SideNavbar from "../components/SideNavbar";
import Footer from "../components/Footer";

function MainLayout({ children }) {
  return (
    <>
      <TopNavbar />

      <div style={{ display: "flex" }}>
        <SideNavbar />

        <main style={{ flex: 1, padding: "30px" }}>
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
}

export default MainLayout;