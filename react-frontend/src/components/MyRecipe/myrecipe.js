import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FilterGrid from '../FilterSearch/FilterGrid/filtergrid';
import axios from 'axios';
import FilterForm from '../FilterForm/filterform'
import Footer from '../Footer/footer';
import Pagination from '@mui/material/Pagination';

const MyRecipe = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [recipesData, setRecipesData] = useState([]);
  const [cuisine, setCuisine] = useState('');
  const [baseRecipe, setBaseRecipe] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [diets, setDiets] = useState('');
  const [ordering, setOrdering] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [creator, setCreator] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [dietsList, setDietsList] = useState([]);
  const [baseRecipes, setBaseRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("search") || '');
  const [recipesData1, setRecipesData1] = useState([]);
  const [recipesData2, setRecipesData2] = useState([]);
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);
  const [totalRecipes1, setTotalRecipes1] = useState(0);
  const [totalRecipes2, setTotalRecipes2] = useState(0);

  // Handles the current page number for created and liked recipes
  const handlePageChange1 = (event, value) => {
    setPage1(value);
  };

  const handlePageChange2 = (event, value) => {
    setPage2(value);
  };

  // Handles the selected filters
  const onSelectIngredients = (selectedList) => {
    const selectedIngredients = selectedList.map((ingredient) => ingredient.name).join(',');
    setIngredients(selectedIngredients);
  };

  const onSelectDiets = (selectedList) => {
    const selectedDiets = selectedList.map((diet) => diet.name).join(',');
    setDiets(selectedDiets);
  };

  const onSelectCuisine = (selectedList) => {
    const selectedCuisine = selectedList.map((cuisine) => cuisine.name).join(',');
    setCuisine(selectedCuisine);
  };

  // Retrieve search parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchTermParam = params.get('search');
    if (searchTermParam) {
      setSearchTerm(searchTermParam);
    }
  }, []);  

  // Retrieve existing filter options from database
  useEffect(() => {
    const fetchFilterData = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      };
  
      const cuisineResponse = await axios.get('http://localhost:8000/recipe/cuisine/', config);
      setCuisines(cuisineResponse.data.results);
  
      const ingredientsResponse = await axios.get('http://localhost:8000/recipe/ingredient/', config);
      setIngredientsList(ingredientsResponse.data.results);
  
      const dietsResponse = await axios.get('http://localhost:8000/recipe/diet/', config);
      setDietsList(dietsResponse.data.results);

      const baseRecipesResponse = await axios.get('http://localhost:8000/recipe/list/', config);
      setBaseRecipes(baseRecipesResponse.data.results);
    };
  
    fetchFilterData();
  }, []);

  // Add parameters to GET request and send GET requests
  useEffect(() => {
    const fetchFilteredRecipes = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      };

      const url1 = new URL('http://localhost:8000/recipe/created/');
      try {
        url1.searchParams.set('page', page1);
        if (cuisine) url1.searchParams.set('cuisine', cuisine);
        if (baseRecipe) url1.searchParams.set('base_recipe', baseRecipe);
        if (ingredients) url1.searchParams.set('ingredients', ingredients);
        if (diets) url1.searchParams.set('diet', diets);
        if (ordering) url1.searchParams.set('ordering', ordering);
        if (searchTerm) url1.searchParams.set('search', searchTerm);
        if (creator) url1.searchParams.set('username', creator);

        const response1 = await axios.get(url1.toString(), config);
        setRecipesData1(response1.data.results);
        setTotalRecipes1(response1.data.count);
      } catch (error) {
        console.log(error)
      }

      const url2 = new URL('http://localhost:8000/recipe/liked/');
      try {
        url2.searchParams.set('page', page2);
        if (cuisine) url2.searchParams.set('cuisine', cuisine);
        if (baseRecipe) url2.searchParams.set('base_recipe', baseRecipe);
        if (ingredients) url2.searchParams.set('ingredients', ingredients);
        if (diets) url2.searchParams.set('diet', diets);
        if (ordering) url2.searchParams.set('ordering', ordering);
        if (searchTerm) url2.searchParams.set('search', searchTerm);
        if (creator) url2.searchParams.set('username', creator);

        const response2 = await axios.get(url2.toString(), config);
        setRecipesData2(response2.data.results);
        setTotalRecipes2(response2.data.count);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFilteredRecipes();
  }, [cuisine, baseRecipe, ingredients, diets, ordering, creator, searchTerm, page1, page2]);
  
  const handleFormSubmit = (event) => {
    event.preventDefault();
    setRecipesData([]);
  }

  return (
    <div>
      <div className='filter-container'>
        <FilterForm
          title='My Recipes'
          cuisines={cuisines}
          ingredientsList={ingredientsList}
          dietsList={dietsList}
          baseRecipes={baseRecipes}
          onSelectIngredients={onSelectIngredients}
          onSelectDiets={onSelectDiets}
          onSelectCuisine={onSelectCuisine}
          onBaseRecipeChange={(e) => setBaseRecipe(e.target.value)}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onOrderingChange={(e) => setOrdering(e.target.value)}
          onCreatorChange={(e) => setCreator(e.target.value)}
          handleFormSubmit={handleFormSubmit}
          baseRecipe={baseRecipe}
          searchTerm={searchTerm}
          ordering={ordering}
        />
        <div className="filter-grid-container">
          <h1>Created Recipes</h1>
          {recipesData1.length === 0 ? (<p>No results found.</p>) : (<FilterGrid recipesData={recipesData1}/>)}
          <div className="pagination-container">
            <Pagination
              count={Math.ceil(totalRecipes1 / 10)}
              page={page1}
              onChange={handlePageChange1}
            />
          </div>
          <h1>Liked Recipes</h1>
          {recipesData2.length === 0 ? (<p>No results found.</p>) : (<FilterGrid recipesData={recipesData2}/>)}
          <div className="pagination-container">
            <Pagination
              count={Math.ceil(totalRecipes2 / 10)}
              page={page2}
              onChange={handlePageChange2}
            />
          </div>        
        </div>
      </div>
      <Footer />
    </div>
  );
  
};  
export default MyRecipe;