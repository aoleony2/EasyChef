import React, { useState, useEffect, useCallback} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import FormData from 'form-data';
import '../../css/bootstrap.min.css';
import "./userinfo.css";

function UserProfile(){
    const [data, setdata] = useState('');
    const [username, setUsername] = useState('')
    const [first_name, setFirst] = useState('');
    const [last_name, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [phone_num, setPhone] = useState('');
    const [profile_pic, setPic] = useState('');
    const [description , setDescription] = useState(0);
    const [new_password1 , setPassword1] = useState(0);
    const [new_password2 , setPassword2] = useState(0);
    let navigate = useNavigate();

    const [userData, setUserData] = useState(null);

    const fetchMyProfile = useCallback(async () => {
      try {
        const response = await axios.get('http://localhost:8000/accounts/user/edit/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        setdata(response.data);
      } catch (error) {
        window.alert("something wrong");
      }
    }, []);

    useEffect(() => {
      fetchMyProfile();
    }, [fetchMyProfile]);


    async function updateHander(e) {
      e.preventDefault();
      const payload = new FormData();
      payload.append('username', username || data.username);
      payload.append('first_name', first_name || data.first_name);
      payload.append('last_name', last_name || data.last_name);
      payload.append('email', email || data.email);
      payload.append('phone_num', phone_num || data.phone_num);
      payload.append('description', description || data.description);
      if (profile_pic) {
        payload.append('profile_pic', profile_pic, profile_pic.name);
      }
      if (new_password1 &&  new_password2){
        payload.append('new_password1', new_password1);
        payload.append('new_password2', new_password2);
      }
      axios({
        method: 'put',
        url: 'http://localhost:8000/accounts/user/edit/',
        data: payload,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'content-type': 'multipart/form-data'
        }
      }).then((response) => {
        window.alert("Update complete");
        fetchMyProfile();
      }).catch((e) => {
        console.log(e);
        window.alert("something wrong");
      });
    }
    
    
  

    return(<>
    <div className="container">
      <h1 className="display-6 my-profile-title">My Profile</h1>
      <div className="row gutters">
      <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
      <div className="card h-1000">
        <div className="card-body">
          <div className="account-settings">
          <div className="user-profile">
            <div className="user-avatar">
              <img src={data.profile_pic} height="200" width="200" alt="user's avatar" />
            </div>
            <h5 className="user-name">Username: {data.username}</h5>
            <h6 className="user-email mb-2">First name: {data.first_name}</h6>
            <h6 className="user-email mb-2">Last name: {data.last_name}</h6>
            <h6 className="user-email mb-2">Email: {data.email}</h6>
            <h6 className="user-email mb-2">Phone number:{data.phone_num}</h6>
            <h6 className="user-email mb-2">Description: {data.description}</h6>
          </div>
            
          </div>
        </div>
      </div>
      </div>
      <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
      <div className="card h-1000">
        <div className="card-body">
          <div className="col gutters ">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
              <h6 className="mb-2 text-primary">Personal Details</h6>
            </div>
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
              <div className="form-group">
                <label htmlFor="avatar" className="mb-2">Change Your Avatar</label>
                <input type="file" className="form-control" id="avatar" onChange={(e)=>{setPic(e.target.files[0])}} accept="image/*"></input>
              </div>
              
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div className="form-group">
                <label htmlFor="username" className="mb-2">Username</label>
                <input type="text" className="form-control" id="username" onChange={(e)=>{setUsername(e.target.value)}} defaultValue={data.username}></input>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div className="form-group">
                <label htmlFor="firstName" className="mb-2">First Name</label>
                <input type="text" className="form-control" id="firstName" onChange={(e)=>{setFirst(e.target.value)}} defaultValue={data.first_name}></input>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div className="form-group">
                <label htmlFor="lastName" className="mb-2">Last Name</label>
                <input type="text" className="form-control" id="lastName" onChange={(e)=>{setLast(e.target.value)}} defaultValue={data.last_name}></input>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div className="form-group">
                <label htmlFor="eMail" className="mb-2">Email</label>
                <input type="email" className="form-control" id="eMail" onChange={(e)=>{setEmail(e.target.value)}} defaultValue={data.email}></input>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div className="form-group">
                <label htmlFor="phone" className="mb-2">Phone Number</label>
                <input type="text" className="form-control" id="phone" onChange={(e)=>{setPhone(e.target.value)}} defaultValue={data.phone_num}></input>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div className="form-group">
                <label htmlFor="description" className="mb-2">Description</label>
                <input type="text" className="form-control" id="description" onChange={(e)=>{setDescription(e.target.value)}} defaultValue={data.description}></input>
              </div>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div class="form-group">
                <label for="password1" class="mb-2">New password</label>
                <input type="password" class="form-control" id="password1" onChange={(e)=>{setPassword1(e.target.value)}}></input>
              </div>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
              <div class="form-group">
                <label for="password2" class="mb-2">Repeat New password</label>
                <input type="password" class="form-control" id="password2" onChange={(e)=>{setPassword2(e.target.value)}}></input>
              </div>
            </div>
          </div>
          
          <div className="row gutters update-button">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
              <div className="text-right">
                <button  onClick={updateHander} type="submit" id="buttons" name="submit" className="btn btn-primary">Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
    </>)
}

export default UserProfile;