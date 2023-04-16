import React from 'react';
import RecipeCard from '../recipecard/recipecard';
import { Pagination } from '@mui/material';
import '../style.css';

const RecipesGrid = ({ recipesData }) => {
  return (
    <>
    <div className="recipes-grid">
      {recipesData && recipesData.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
    </div>
    </>
  );
};

export default RecipesGrid;
