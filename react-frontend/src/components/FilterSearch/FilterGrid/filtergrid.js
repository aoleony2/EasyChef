import React from 'react';
import RecipeCard from '../../MyRecipe/recipecard/recipecard';
import '../style.css';

const FilterGrid = ({ recipesData }) => {
  return (
    <div className="filter-grid">
      {recipesData && recipesData.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default FilterGrid;
