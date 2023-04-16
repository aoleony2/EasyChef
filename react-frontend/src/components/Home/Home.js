import React, { useState, useEffect } from 'react';
import RecipesGrid from '../MyRecipe/recipesgrid/recipesgrid.js';
import Footer from '../Footer/footer';
import '../../css/bootstrap.min.css';
import axios from "axios";

function Home() {
  const [recipesData, setRecipesData1] = useState([]);

  useEffect(() => {
    const fetchRecipesData = async () => { 
      const response = await axios.get(
        "http://localhost:8000/recipe/list/?ordering=-overall_rating,-like_num"
      );
      setRecipesData1(response.data.results);
    };
    
    fetchRecipesData();
  }, []);

  return (
    <div>
      <div className="container col-xxl-8 px-4 py-5">
        <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
          <div className="col-10 col-sm-8 col-lg-6">
          <img src="Easy chef.png" className="d-block mx-lg-auto img-fluid" alt="Bootstrap Themes" width="700" height="500" loading="lazy"/>
          </div>
          <div className="col-lg-6">
          <h1 className="display-5 fw-bold lh-1 mb-3">Easy Chef, your best assisstant of cooking</h1>
          <p className="lead">With Easy Chef, you can search through millions of different recipes from various diets and ingredients from all over the world! You can also share your custom recipe with everyone! You don't need to worry about the shopping list either; Easy Chef takes care of that as well!</p>
          <div className="d-grid gap-2 d-md-flex justify-content-md-start">
          </div>
          </div>
        </div>
      </div>
      <section className="py-5 text-center container bg-body-secondary shadow-lg">
        <div className="row py-lg-4">
          <div className="col-lg-6 col-md-8 mx-auto">
          <h1 className="fw-light">The Popular Recipes</h1>
          <p className="lead text-muted">You can fine recipes from all over the world... Enjoy the best!</p>
          </div>
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <RecipesGrid recipesData={recipesData} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home