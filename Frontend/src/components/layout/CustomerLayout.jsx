import CustomerNavbar from "./CustomerNavbar";
import Footer from "./Footer";

export default function CustomerLayout({ children }) {
  return (
    <>
      <CustomerNavbar />
      {children}
      <Footer />
    </>
  );
}
