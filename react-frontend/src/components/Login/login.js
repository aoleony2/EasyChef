import "./login.css";
import React, {useLayoutEffect, useState} from "react";
import axios from 'axios';
import Cookies from 'js-cookie'
import {useNavigate} from "react-router-dom";
import {mutate} from "swr";
import {useUser} from "../../hooks/useUser";
import Footer from '../Footer/footer';

function Login(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { user } = useUser()
    useLayoutEffect(() => {
        if (user) {
            navigate("/");
        }
    });

    async function loginHander(e) {
        e.preventDefault();
        axios.post('http://localhost:8000/accounts/user/login/', {
          username,
          password,
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((response) => {
          const { data } = response;
          const accessToken = data.access;
          if (accessToken) {
            localStorage.setItem('access_token', accessToken);
            window.alert("login success");
            navigate("/user");
          }
        }).catch((e) => {
          window.alert("login error, check your username and password")
        });
      }
      

    return(<div>
        <section>
		<h1> Log in </h1>

		<form onsubmit="return false">
			<label>Username: <br/></label>
        <input type="username" onChange={(e)=>{setUsername(e.target.value)}} value={username} className="form-control"  placeholder="Input your Username" required /><br/>

			<label>Password: <br/></label>
        <input type="password" onChange={(e)=>{setPassword(e.target.value)}} value={password} className="form-control"  placeholder="Input your password" required /><br/>
			
            <input onClick={loginHander} type="submit" value="Login" id="Login"/>
		</form>
	</section>
  <Footer />
    </div>)
}

export default Login;