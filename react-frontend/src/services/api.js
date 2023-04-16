import axios from 'axios';

export const getAuth = () => {
  return axios({
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
    url: 'http://localhost:8000/accounts/user/auth/',
  });
}