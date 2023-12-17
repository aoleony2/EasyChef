import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { mutate } from "swr";
import { useUser } from "../../hooks/useUser";
import '../../css/bootstrap.min.css';

function NavBar() {
  const { user } = useUser();
  const [data, setdata] = useState('');
  const navigate = useNavigate();

  async function getUser() {
    if (localStorage.getItem("access_token")) {
      try {
        const response = await axios.get('http://localhost:8000/accounts/user/edit/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        localStorage.setItem("userid", response.data["id"]);
        setdata(response.data);
      } catch (error) {
        console.log(error);
      }
    }
  }
  
  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      getUser();
    }
  }, []);
  

  const logoutHandler = () => {
    if (localStorage.getItem("access_token")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("userid");
      mutate("/auth");
      window.alert("Logout successful!");
      navigate("/login");
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          <img src="/Easy chef.png" alt="image" height="60" width="60" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" exact="true">
              Home
            </Nav.Link>
            {localStorage.getItem("access_token") ? (
              <Nav.Link as={NavLink} to="/myrecipe">
                My Recipe
              </Nav.Link>
            ) : (
              <></>
            )}
            {localStorage.getItem("access_token") ? (
              <Nav.Link as={NavLink} to="/newRecipe">
                Create New Recipe
              </Nav.Link>
            ) : (
              <></>
            )}
            {localStorage.getItem("access_token") ? (
              <Nav.Link as={NavLink} to="/shoppinglist">
                Shopping List
              </Nav.Link>
            ) : (
              <></>
            )}
          </Nav>
          <Form className="d-flex" action="/search">
            <FormControl
              name="search"
              type="search"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-success" type="submit">
              Search
            </Button>
          </Form>
          {localStorage.getItem("access_token") ? (
            <Nav.Link
              as={NavLink}
              to="/user"
              onMouseEnter={(e) => {
                getUser();
              }}
            >
              {data.profile_pic ? (
                <Nav.Link as={NavLink} to="/user">
                  <img src={data.profile_pic} alt="profile" height="50" width="50" className="rounded-circle"/>
                </Nav.Link>
              ) : (
                <Nav.Link as={NavLink} to="" disabled>
                  <img
                    src="/user_placehoder.png"
                    alt="profile"
                    height="50"
                    width="50"
                  />
                </Nav.Link>
              )}
            </Nav.Link>
          ) : (
            <Nav.Link
              as={NavLink}
              to=""
              disabled
              onMouseEnter={(e) => {
                getUser();
              }}
            >
              <img
                src="/user_placehoder.png"
                alt="profile"
                height="50"
                width="50"
              />
            </Nav.Link>
          )}


          <NavDropdown title="" id="basic-nav-dropdown">
            {localStorage.getItem("access_token") ? (
              <Nav.Link as={NavLink} to="/user">
                Profile
              </Nav.Link>
            ) : (
              <Nav.Link as={NavLink} to="/signup">
                Signup
              </Nav.Link>
            )}
            <NavDropdown.Divider />
            {localStorage.getItem("access_token") ? (
              <NavDropdown.Item onClick={logoutHandler}>
                <b style={{ color: "darkred" }}>
                  <u>Logout</u>
                </b>
              </NavDropdown.Item>
            ) : (
              <NavDropdown.Item as={NavLink} to="/login">
                Login
              </NavDropdown.Item>
            )}
          </NavDropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
