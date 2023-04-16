import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Multiselect } from 'multiselect-react-dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import '../FilterForm/style.css'
import Footer from '../Footer/footer';

const ShoppingList = () => {
  const [shoppingData, setShoppingData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [recipesList, setRecipesList] = useState([]);

  useEffect(() => {
    const fetchShoppingList = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      };

      let query = `http://localhost:8000/recipe/shopping_list/`;

      if (selectedRecipes.length > 0) {
        const recipe_name = selectedRecipes.map(recipe => recipe.name).join(',');
        query += `?recipe_name=${recipe_name}`;
      }

      const response = await axios.get(query, config);
      const groupedData = groupAndSumItems(response.data.results);
      setShoppingData(groupedData);

      const recipes = response.data.results.map((item) => ({
        id: item.recipe_id,
        name: item.recipe_name,
      }));
      setRecipesList(recipes);
    };

    fetchShoppingList();
  }, [selectedRecipes]);

  const groupAndSumItems = (data) => {
    const groupedItems = data.reduce((acc, item) => {
      acc[item.name] = acc[item.name] || { name: item.name, amount: 0, recipes: [] };
      acc[item.name].amount += item.amount;
      acc[item.name].recipes.push({ amount: item.amount, serving: item.serving, recipe_name: item.recipe_name, recipe_id: item.recipe_id });
      return acc;
    }, {});

    return Object.values(groupedItems);
  };

  const toggleDropdown = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  const onSelectRecipes = (selectedList, selectedItem) => {
    setSelectedRecipes(selectedList);
  };

  return (
    <div>
      <div className="shopping-cart">
        <h1>Shopping List</h1>
        <div className="cart-items">
          <div className="filter-form">
            <Multiselect
              className="multiselect-white"
              options={recipesList}
              selectedValues={selectedRecipes}
              displayValue="name"
              onSelect={onSelectRecipes}
              onRemove={onSelectRecipes}
              placeholder="Filter by Recipe"
            />
          </div>
          {shoppingData.map((item, index) => (
            <div className="cart-item-container" key={index}>
              <div className="cart-item" onClick={() => toggleDropdown(index)}>
                <input
                  type="checkbox"
                  className="item-checkbox"
                  onClick={handleCheckboxClick} // Add the onClick handler
                />
                <div className="item-info">
                  <h3>
                    {item.name} - {item.amount}g
                  </h3>
                </div>
              </div>
              {expandedIndex === index && (
                <div className="collapse show">
                  <div className="accordion-body">
                    <div className="row d-flex justify-content-between align-items-center">
                      <ul className="list-group">
                        <h6 className="text-black mb-0">Used for:</h6>
                        {item.recipes.map((recipe, i) => (
                          <li key={i} className="list-group-item">
                            {recipe.recipe_name} - {recipe.amount}g - {recipe.serving} servings
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ShoppingList;
