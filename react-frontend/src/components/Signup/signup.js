import "./signup.css";
import React, {useEffect, useState} from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";

function Signup(){
    const [username, setUsername] = useState('');
    const [password1, setPw1] = useState('');
    const [password2, setPw2] = useState('');
    const [first_name, setFirst] = useState('');
    const [last_name, setLast] = useState('');
    const [phone_num, setPhone] = useState('');
    const [email, setEmail] = useState('');
    
    const navigate = useNavigate();
    async function signupHander(e) {
        e.preventDefault();
        axios.post('http://localhost:8000/accounts/user/signup/', {
            username,
            first_name,
            last_name,
            email,
            phone_num,
            password1,
            password2,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {  
            const { data } = response;
            window.alert("Signup Successful");
            navigate("/login");
        }).catch((e) => {
           console.log(e);
           window.alert("Signup Error, check the password length(>=8)");
        });
    }
    return(<div>
        <section>
		<h1> Sign Up </h1>

		<form>
            <label>Username: </label><br/>
            <input type="username" onChange={(e)=>{setUsername(e.target.value)}} value={username} className="form-control"  placeholder="Input your Username" required /><br/>

            <label>Password: </label><br/>
            <input type="password" onChange={(e)=>{setPw1(e.target.value)}} value={password1} className="form-control"  placeholder="Input your password" required /><br/>

            <label>Repeat Password: </label><br/>
            <input type="password" onChange={(e)=>{setPw2(e.target.value)}} value={password2} className="form-control"  placeholder="Confirm your password" required /><br/>

            <label>Email: </label><br/>
            <input type="email" onChange={(e)=>{setEmail(e.target.value)}} value={email} className="form-control"  placeholder="Input your email" /><br/>

            <label>Phone: </label><br/>
            <input type="phone_num" onChange={(e)=>{setPhone(e.target.value)}} value={phone_num} className="form-control"  placeholder="Input your phone_num" /><br/>

            <label>First name: </label><br/>
            <input type="first_name" onChange={(e)=>{setFirst(e.target.value)}} value={first_name} className="form-control"  placeholder="Input your first name" /><br/>

            <label>Last name: </label><br/>
            <input type="last_name" onChange={(e)=>{setLast(e.target.value)}} value={last_name} className="form-control"  placeholder="Input your last name" /><br/>

            <input onClick={signupHander} type="submit" value="Register" id="register"/>
        </form>

	</section>
    </div>)

}

export default Signup;