import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FilterGrid from './FilterGrid/filtergrid';
import axios from 'axios';
import FilterForm from '../FilterForm/filterform'
import Footer from '../Footer/footer';
import Pagination from '@mui/material/Pagination';

const FilterSearch = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [recipesData, setRecipesData] = useState([]);
  const [cuisine, setCuisine] = useState('');
  const [baseRecipe, setBaseRecipe] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [diets, setDiets] = useState('');
  const [ordering, setOrdering] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [dietsList, setDietsList] = useState([]);
  const [baseRecipes, setBaseRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("search") || '');
  const [creator, setCreator] = useState('');
  const [page, setPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);

  // Handles the current page number for created and liked recipes
  const handlePageChange = (event, value) => {
    setPage(value);
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

  // Add parameters to GET request and send GET request
  useEffect(() => {
    const fetchFilteredRecipes = async () => {
      const url = new URL('http://localhost:8000/recipe/list/');
      try {
        url.searchParams.set('page', page);
        if (cuisine) url.searchParams.set('cuisine', cuisine);
        if (baseRecipe) url.searchParams.set('base_recipe', baseRecipe);
        if (ingredients) url.searchParams.set('ingredients', ingredients);
        if (diets) url.searchParams.set('diet', diets);
        if (ordering) url.searchParams.set('ordering', ordering);
        if (searchTerm) url.searchParams.set('search', searchTerm);
        if (creator) url.searchParams.set('username', creator);

        const response = await axios.get(url.toString());
        setRecipesData(response.data.results);
        setTotalRecipes(response.data.count);
      } catch (error) {
        console.log(error)
      }
    };
  
    fetchFilteredRecipes();
  }, [cuisine, baseRecipe, ingredients, diets, ordering, searchTerm, creator, page]);

  return (
    <div>
      <div className='filter-container'>
      <FilterForm
          title='Filter Recipes'
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
          creator={creator}
          baseRecipe={baseRecipe}
          searchTerm={searchTerm}
          ordering={ordering}
      />
        <div className="filter-grid-container">
          {recipesData.length === 0 ? (<p>No results found.</p>) : (<FilterGrid recipesData={recipesData}/>)}
        </div>
      </div>
      <div className="pagination-container">
        <Pagination
          count={Math.ceil(totalRecipes / 10)}
          page={page}
          onChange={handlePageChange}
        />
      </div>
      <Footer />
    </div>
  );
  
};  
export default FilterSearch;