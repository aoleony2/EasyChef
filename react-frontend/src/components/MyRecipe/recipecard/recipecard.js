import React from 'react';
import { Rating } from '@douyinfe/semi-ui';
import Default_Image_Thumbnail from "../../../media/Default_Image_Thumbnail.png";

const RecipeCard = ({ recipe }) => {
  // Renders list of ingredients on card (max 3)
  const renderIngredients = () => {
    let ingredients = recipe.ingredients.slice(0, 2);
    if (recipe.ingredients.length > 2) {
      ingredients.push({ name: '...', amount: '' });
    }

    return ingredients.map((ingredient) => (
      <li key={ingredient.name}>{ingredient.name}</li>
    ));
  };

  // Renders list of diets on card (max 3)
  const renderDiets = () => {
    let diets = recipe.diets.slice(0, 2);
    if (recipe.diets.length > 2) {
      diets.push({ name: '...', amount: '' });
    }
    return diets.map((diet) => (
      <li key={diet.id}>{diet.name}</li>
    ));
  };

  return (
    <div className="col-md-4">
      <div className="card hoverable-card" style={{ maxHeight: '40rem' }}>
        <img src={recipe.media_list.length > 0 ? recipe.media_list[0].media_file : Default_Image_Thumbnail} className="card-img-top" alt="Recipe Image" />
        <div className="card-body">
          <h5 className="card-title">
            {recipe.name}
            <small className="text-muted"> {recipe.prep_time} min</small>
          </h5>
          <Rating
            defaultValue={recipe.overall_rating}
            precision={0.5}
            max={5}
            className="checked"
          />
          <p className="card-text">Ingredients:</p>
          <ul>{renderIngredients()}</ul>
          <p className="card-text">Diets:</p>
          <ul>{renderDiets()}</ul>
          <a href={`./recipe/${recipe.id}`} className="stretched-link"></a>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
