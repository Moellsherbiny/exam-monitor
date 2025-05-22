import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';

const AppNavbar: React.FC = () => {
  return (
    <Navbar>
      <Container>
        <Navbar.Brand href="/">
          نظام كشف الغش
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#student">واجهة الطالب</Nav.Link>
            <Nav.Link href="#supervisor">لوحة المراقبة</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#alerts">
              التنبيهات <Badge bg="danger">3</Badge>
            </Nav.Link>
            <Nav.Link href="#logout">تسجيل الخروج</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;