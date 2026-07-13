import TopNavbar from "./TopNavbar";
import SideNavbar from "./SideNavbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <>
      <TopNavbar />

      <div style={{ display: "flex" }}>
        <SideNavbar />

        <main className="main-content" style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Layout;