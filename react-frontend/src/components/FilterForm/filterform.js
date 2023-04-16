import React, { useState } from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import './style.css'

const FilterForm = ({
    title,
    cuisines,
    ingredientsList,
    dietsList,
    baseRecipes,
    onSelectIngredients,
    onSelectDiets,
    onSelectCuisine,
    onBaseRecipeChange,
    onSearchChange,
    onOrderingChange,
    onCreatorChange,
    creator,
    baseRecipe,
    searchTerm,
    ordering,
  }) => {

    return (
        <div>
            <h1>{title}</h1>
            <form className='filters'>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Search:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={onSearchChange}
                            placeholder="Search by name"
                        />
                    </div>
                    <label>Ingredients:</label>
                    <Multiselect
                        className="multiselect-white"
                        options={ingredientsList}
                        selectedValues={[]}
                        displayValue="name"
                        onSelect={onSelectIngredients}
                        onRemove={onSelectIngredients}
                        placeholder="Select Ingredient"
                    />
                    <label>Diets:</label>
                    <Multiselect
                        className="multiselect-white"
                        options={dietsList}
                        selectedValues={[]}
                        displayValue="name"
                        onSelect={onSelectDiets}
                        onRemove={onSelectDiets}
                        placeholder="Select Diet"
                    />
                    <label>Cuisine:</label>
                    <Multiselect
                        className="multiselect-white"
                        options={cuisines}
                        selectedValues={[]}
                        displayValue="name"
                        onSelect={onSelectCuisine}
                        onRemove={onSelectCuisine}
                        placeholder="Select Cuisine"
                    />
                    <div style={{ marginBottom: '10px' }}>
                        <label>Created by:</label>
                        <input
                            type="text"
                            value={creator}
                            onChange={onCreatorChange}
                            placeholder="Search by user"
                        />
                    </div>
                    <label>Base Recipe:</label>
                    <select value={baseRecipe} onChange={onBaseRecipeChange}>
                        <option value="">Select Base Recipe</option>
                        {baseRecipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.name}>
                            {recipe.name}
                        </option>
                        ))}
                    </select>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Order by:</label>
                        <select value={ordering} onChange={onOrderingChange}>
                            <option value="-like_num">Most Popular</option>
                            <option value="like_num">Least Popular</option>
                            <option value="-overall_rating">Highest Rated</option>
                            <option value="overall_rating">Lowest Rated</option>
                            <option value="name">Name</option>
                            <option value="-name">Name (descending)</option>
                            <option value="prep_time">Preparation Time</option>
                            <option value="-prep_time">Preparation Time (descending)</option>
                            <option value="cook_time">Cooking Time</option>
                            <option value="-cook_time">Cooking Time (descending)</option>
                            <option value="serving">Serving Size</option>
                            <option value="-serving">Serving Size (descending)</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FilterForm;
