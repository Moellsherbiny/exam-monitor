import { Outlet, Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Nav } from "react-bootstrap";

const Layout = () => {
  return (
    <>
      <Navbar className="bg-body-tertiary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand >Examlyzer - نظام</Navbar.Brand>
          <Navbar.Toggle />
          <Nav className="me-end">
            <Nav.Link>
              <Link to="/">الرئيسية</Link>
            </Nav.Link>
            <Nav.Link>
              <Link to="/about">من نحن</Link>
            </Nav.Link>
          </Nav>

        </Container>
      </Navbar>

      <main >

        <Outlet />
      </main>
    </>
  )
};

export default Layout;