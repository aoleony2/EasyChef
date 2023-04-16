import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { Spinner, Container, Row, Col } from "react-bootstrap";
import { FavoriteBorder, Favorite } from "@mui/icons-material";
import {
  Avatar,
  Card,
  Stack,
  TextField,
  Rating,
  Grid,
  IconButton,
  List,
  FormControl,
  ListItem,
  Input,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Box } from "@mui/system";
import ImageGallery from "react-image-gallery";

const NewRecipe = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [diets, setDiets] = useState([{name: ""}]);
  const [cookTime, setCookTime] = useState(0);
  const [prepTime, setPrepTime] = useState(0);
  const [serving, setServing] = useState(0);
  const [ingredients, setIngredients] = useState([{ name: "", amount: 0 }]);
  const [cuisine, setCuisine] = useState([]);
  const [steps, setSteps] = useState([
    {
      description: "",
      prep_time: 0,
      cook_time: 0,
      media_list: [],
      order: null,
    },
  ]);
  const [mediaList, setMediaList] = useState([]);
  const [baseRecipe, setBaseRecipe] = useState("");
  const [base_recipe_list, setBaseRecipes] = useState([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      };

      const baseRecipesResponse = await axios.get(
        "http://localhost:8000/recipe/list/",
        config
      );
      setBaseRecipes(baseRecipesResponse.data.results);
    };

    fetchFilterData();
  }, []);

  const handleIngredientsChange = (e, index, mode) => {
    const newIngredients = [...ingredients];
    newIngredients[index][mode] = e.target.value;
    setIngredients(newIngredients);
  };
  const handleDietsChange = (e, index) => {
    const newDiets = [...diets];
    newDiets[index]['name'] = e.target.value;
    setDiets(newDiets);
  }

  const handleBaseRecipeChange = e => {
    const info = base_recipe_list.filter(item => item.name === e.target.value)[0];
    setName(info.name)
    setCookTime(info.cook_time)
    setPrepTime(info.prep_time)
    setCuisine(info.cuisine)
    setDescription(info.description)
    setDiets(info.diets)
    setIngredients(info.ingredients)
    setServing(info.serving)
    setSteps(info.step_list)
    setBaseRecipe(e.target.value);
  };

  const handleStepChange = (e, index, mode) => {
    const { name, value } = e.target;
    const newSteps = [...steps];
    newSteps[index][name] = mode === "description" ? value : parseInt(value);
    setSteps(newSteps);
    setCookTime(
      newSteps
        .map(step => step.cook_time)
        .reduce((partialSum, a) => partialSum + a, 0)
    );
    setPrepTime(
      newSteps
        .map(step => step.prep_time)
        .reduce((partialSum, a) => partialSum + a, 0)
    );
  };

  const handleImageChange = (e, index) => {
    const newSteps = [...steps];
    const { files } = e.target;
    newSteps[index].media_list = [];
    for (let i = 0; i < files.length; i++) {
      newSteps[index].media_list.push({ media_file: URL.createObjectURL(files[i]) });
    }

    setSteps(newSteps);
  };
  const handleRecipeMediaChange = (e) => {
    const {files} = e.target;
    let newList = []
    for (let i = 0; i < files.length; i++) {
      newList.push({ media_file: URL.createObjectURL(files[i])})
    }
    setMediaList(newList)
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        description: "",
        prep_time: 0,
        cook_time: 0,
        media_list: [],
        order: null,
      },
    ]);
  };
  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        name: "",
        amount: 0,
      },
    ]);
  };
  const handleAddDiet = () => {
    setDiets([
      ...diets,
      {
        name: "",
      },
    ]);
  };
  const handleRemoveStep = index => {
    setSteps(
      steps.filter(function (item) {
        return item !== steps[index];
      })
    );
  };
  const handleRemoveIngredient = index => {
    setIngredients(
      ingredients.filter(function (item) {
        return item !== ingredients[index];
      })
    );
  };
  const handleRemoveDiet = index => {
    setDiets(
      diets.filter(function (item) {
        return item !== diets[index];
      })
    );
  };

  const handleSubmit = async (e) => {
    alert('submitting')
    e.preventDefault()
    const payload = new FormData();
    payload.append('name', name);
    payload.append('description', description);
    payload.append('cuisine', cuisine);
    payload.append('serving', serving);
    payload.append('base_recipe', baseRecipe);
    let count = 0;
    for (let diet of diets) {
      if (diet) {
        payload.append(`diets[${count}]name`, diet.name);
        count += 1
      }
    }
    count = 0
    for (let ingredient of ingredients) {
      if (ingredient) {
        payload.append(`ingredients[${count}]name`, ingredient.name)
        payload.append(`ingredients[${count}]amount`, ingredient.amount)
        count += 1
      }
    }
    count = 0
    for (let media of mediaList) {
      if (media) {
        let blob = await fetch(media.media_file).then(r => r.blob());
        payload.append(`media_list[${count}]media_file`, blob, media.media_file)
        count += 1
      }
    }
    let index = 0
    for (let step of steps) {
      if (step) {
        payload.append(`step_list[${index}]cook_time`, step.cook_time)
        payload.append(`step_list[${index}]prep_time`, step.prep_time)
        payload.append(`step_list[${index}]description`, step.description)
        payload.append(`step_list[${index}]order`, index+1)
        let count = 0
        for (let media of step.media_list) {
          if (media) {
            let blob = await fetch(media.media_file).then(r => r.blob());
            payload.append(`step_list[${index}]media_list[${count}]media_file`, blob, media.media_file.split("/").pop())
            count += 1
          }
          
        }
        index += 1
      }
    }
    
    for (var pair of payload.entries()) {
      console.log(pair[0]+ ': ' + pair[1]); 
    }
    axios.post('http://127.0.0.1:8000/recipe/create/', payload, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'content-type': 'multipart/form-data'
      }
    }).then((response) => {
      window.alert("recipe created");
      if (response.data) {
        window.location = "http://127.0.0.1:3000/recipe/"+response.data.id
      }
    }).catch((error) => {
      console.log(error);
      alert(JSON.stringify(error.response.data));
    });
  };


  return (
    <Box component={"form"} sx={{ p: "10px" }}>
      <h1> Create New Recipe </h1>
      <FormControl
        className="new-recipe-form"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
        
      >
        <Stack spacing={2}>
          <List>
            <ListItem>
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="demo-select-small">Base Recipe</InputLabel>
                <Select
                  id="base-recipe"
                  labelId="demo-select-small"
                  value={baseRecipe}
                  defaultValue=""
                  label="base-recipe"
                  onChange={handleBaseRecipeChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {base_recipe_list.map((recipe, index) => {
                    return <MenuItem key={index} value={recipe.name}>{recipe.name}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <label className="recipe-label mx-2 col-4" htmlFor="name">
                Name
              </label>
              <TextField
                className="recipe-input"
                type="text"
                name="name"
                label="Name"
                id="name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                }}
                required
              />
            </ListItem>
            <ListItem>
              <label className="recipe-label mx-2 col-4" htmlFor="description">
                Description
              </label>
              <TextField
                multiline
                className="description"
                name="description"
                id="description"
                label="Description"
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                }}
                required
              />
            </ListItem>
            <ListItem>
              <label className="recipe-label mx-2 col-4" htmlFor="serving">
                Serving
              </label>
              <input
                className="serving"
                label="Serving"
                id="serving"
                type="number"
                name="serving"
                value={serving}
                required
                min={"0"}
                onChange={e => setServing(parseInt(e.target.value))}
              />
            </ListItem>
            <ListItem>
              <label className="recipe-label ml-2 col-5" htmlFor="cookTime">
                Total Cook Time
              </label>
              <input
                className="cookTime "
                label="cookTime"
                id="cookTime"
                type="number"
                min={"0"}
                name="cook_time"
                value={cookTime}
                disabled
              />
            </ListItem>
            <ListItem>
              <label className="recipe-label mx-2 col-4" htmlFor="prepTime">
                Total Prep Time
              </label>
              <input
                className="prepTime"
                label="prepTime"
                id="prepTime"
                name="prep_time"
                type="number"
                min={"0"}
                value={prepTime}
                disabled
              />
            </ListItem>
            <ListItem>
              <label className="recipe-label mx-2 col-4" htmlFor="cuisine">
                Cuisine
              </label>
              <TextField
                className="recipe-textarea"
                name="cuisine"
                label="Cuisine"
                id="cuisine"
                value={cuisine}
                onChange={e => {
                  setCuisine(e.target.value);
                }}
                required
              />
            </ListItem>
            <ListItem>
            <label
              className="recipe-label mx-2"
              htmlFor={`recipe-media`}
            >
              Image(s) or Video(s) for recipe
            </label>
            <input
              className=""
              type="file"
              name="images"
              id={`recipe-media`}
              accept={"image/*, video/*"}
              multiple
              onChange={e => handleRecipeMediaChange(e)}
            />
            </ListItem>
            <ListItem>
            {mediaList && mediaList.length > 0 && (
                  <div className={`step--preview w-100`}>
                    <ImageGallery
                      showPlayButton={false}
                      showFullscreenButton={false}
                      items={mediaList.map(media => {
                        media.original = media.media_file
                        media.originalHeight = "200px";
                        media.originalWidth = "200px";

                        if (media.media_file.type === "video") {
                          media.renderItem = video => {
                            return (
                              <video
                                controls
                                muted
                                height={"200px"}
                                width={"200px"}
                              >
                                <source
                                  src={video.original}
                                />
                              </video>
                            );
                          };
                        }
                        return media;
                      })}
                    />
                  </div>
                )}
            </ListItem>
          </List>
          <List>
          {diets.map((diet, index) => (
              <ListItem key={index} className="new-recipe-diet">
                <Card>
                  <Stack spacing={2} className="p-3">
                    <div
                      className="recipe-diet-label"
                      htmlFor={`diet-${index}`}
                    >
                      diet {index + 1}
                    </div>
                    <div>
                      Name
                      <TextField
                        fullWidth
                        className="ingredient-name"
                        name="name"
                        id={`diet-${index}`}
                        value={diet.name}
                        required
                        onChange={e =>
                          handleDietsChange(e, index)
                        }
                      />
                    </div>
                    <button
                    className="w-50 align-self-center my-2"
                      type="button"
                      onClick={()=> {
                        handleRemoveDiet(index)
                      }}
                    >
                      Remove Diet {index+1}
                    </button>
                  </Stack>
                </Card>
              </ListItem>
            ))}
            <button
              className="w-50 align-self-center my-2"
              type="button"
              onClick={handleAddDiet}
            >
              Add Diet
            </button>
            {ingredients.map((ingredient, index) => (
              <ListItem key={index} className="new-recipe-ingredient">
                <Card>
                  <Stack spacing={2} className="p-3">
                    <div
                      className="recipe-ingredient-label"
                      htmlFor={`ingredient-${index}`}
                    >
                      Ingredient {index + 1}
                    </div>
                    <div>
                      Name
                      <TextField
                        fullWidth
                        className="ingredient-name"
                        name="name"
                        id={`ingredient-${index}`}
                        value={ingredient.name}
                        required
                        onChange={e =>
                          handleIngredientsChange(e, index, "name")
                        }
                      />
                    </div>
                    <FormControl>
                      <label className="recipe-label mx-2" htmlFor="amount">
                        Amount
                      </label>
                      <input
                        className="amount"
                        id="amount"
                        name="amount"
                        value={ingredient.amount}
                        type="number"
                        min={"0"}
                        required
                        onChange={e =>
                          handleIngredientsChange(e, index, "amount")
                        }
                      />
                    </FormControl>
                    <button
                      className="w-50 align-self-center my-2"
                      type="button"
                      onClick={() => {
                        handleRemoveIngredient(index)
                      }}
                    >
                      Remove Ingredient {index+1}
                    </button>
                  </Stack>
                </Card>
              </ListItem>
            ))}
            <button
              className="w-50 align-self-center my-2"
              type="button"
              onClick={handleAddIngredient}
            >
              Add Ingredient
            </button>
          </List>
        </Stack>

        <Stack>
          <List>
            {steps.map((step, index) => (
              <ListItem key={index} className="new-recipe-step">
                <Card>
                  <Stack spacing={2} className="p-3">
                    <div
                      className="recipe-step-label"
                      htmlFor={`step-${index}`}
                    >
                      Step {index + 1}
                    </div>
                    <div>
                      Description
                      <TextField
                        multiline
                        fullWidth
                        className="recipe-description"
                        name="description"
                        id={`step-${index}`}
                        value={step.description}
                        onChange={e =>
                          handleStepChange(e, index, "description")
                        }
                        required
                      />
                    </div>
                    <FormControl>
                      <label className="recipe-label mx-2" htmlFor="cookTime">
                        Cooking Time
                      </label>
                      <input
                        className="cookTime"
                        id="cookTime"
                        name="cook_time"
                        value={step.cook_time}
                        type="number"
                        min={"0"}
                        required
                        onChange={e => handleStepChange(e, index, "cook_time")}
                      />
                    </FormControl>
                    <FormControl>
                      <label className="recipe-label mx-2" htmlFor="prepTime">
                        Prep Time
                      </label>
                      <input
                        className="prepTime"
                        id="prepTime"
                        name="prep_time"
                        value={step.prep_time}
                        type="number"
                        min={"0"}
                        onChange={e => handleStepChange(e, index, "prep_time")}
                        required
                      />
                    </FormControl>

                    <label
                      className="recipe-label mx-2"
                      htmlFor={`images-${index}`}
                    >
                      Image(s) or Videos for step {index+1}
                    </label>
                    <input
                      className=""
                      type="file"
                      name="images"
                      id={`images-${index}`}
                      accept={"image/*, video/*"}
                      multiple
                      onChange={e => handleImageChange(e, index)}
                    />
                    <button
                      className="w-50 align-self-center my-2"
                      type="button"
                      onClick={() => {
                        handleRemoveStep(index)
                      }}
                    >
                      Remove Step {index+1}
                    </button>
                  </Stack>
                </Card>

                {step.media_list.length > 0 && (
                  <div className={`step--preview`} style={{width: "300px", height: "300px"}}>
                    <ImageGallery
                      showPlayButton={false}
                      showFullscreenButton={false}
                      items={step.media_list.map(media => {
                        media.original = media.media_file
                        media.originalHeight = "200px";
                        media.originalWidth = "200px";

                        if (media.media_file.type === "video") {
                          media.renderItem = video => {
                            return (
                              <video
                                controls
                                muted
                                height={"200px"}
                                width={"200px"}
                              >
                                <source
                                  src={video.original}
                                />
                              </video>
                            );
                          };
                        }
                        return media;
                      })}
                    />
                  </div>
                )}
              </ListItem>
            ))}
          </List>
          <button
            className="w-50 align-self-center my-2"
            type="button"
            onClick={handleAddStep}
          >
            Add Step
          </button>

          <button className="w-50 align-self-center" type="submit" onClick={handleSubmit}>
            Submit
          </button>
        </Stack>
      </FormControl>
    </Box>
  );
};

export default NewRecipe;
