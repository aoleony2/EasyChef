import React from 'react';
import Nav_Bar from './components/NavBar/navbar.js';
import Home from './components/Home/Home.js';
import Signup from './components/Signup/signup.js';
import Login from './components/Login/login.js';
import MyRecipe from './components/MyRecipe/myrecipe.js';
import FilterSearch from './components/FilterSearch/filtersearch.js';
import UserProfile from './components/Userinfo/userinfo.js';
import ShoppingList from './components/ShoppingList/shoppinglist.js'
import NewRecipe from "./components/CreateNewRecipe/NewRecipe";
import {Routes, Route, Link} from "react-router-dom";
import './App.css';
import RecipeDetails from './components/RecipeDetails/RecipeDetails';
import EditRecipe from './components/EditRecipe/EditRecipe';

function App() {
  return (
    <div className="App">
      <Nav_Bar/>
      <Routes>
        <Route path="/" element={<><Home /></>} />
        <Route path="/signup" element={<><Signup /></>} />
        <Route path="/login" element={<><Login /></>} />
        <Route path="/myrecipe" element={<><MyRecipe /></>} />
        <Route path="/search" element={<><FilterSearch /></>} />
        <Route path="/user" element={<><UserProfile/></>} />
        <Route path="/recipe/:recipe_id" element={<><RecipeDetails/></>} />
        <Route path="/shoppinglist" element={<><ShoppingList/></>} />
        <Route path="/newrecipe" element={<NewRecipe />}></Route>
        <Route path="/edit/:recipe_id" element={<EditRecipe />}></Route>
      </Routes>
    </div>
  );
}

export default App;
