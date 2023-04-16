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
} from "@mui/material";
import { Box } from "@mui/system";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const BasicInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  margin-left: 5rem;
`;
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .active {
    background: linear-gradient(35deg, #494949, #313131);
    color: white !important;
  }
`;
const Button = styled.button`
  padding: 0.1rem 1rem;
  color: #313131 !important;
  background: white;
  border: 2px solid black;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;
const Info = styled.div`
  margin-left: 5rem;
  margin-bottom: 2rem;
`;

const RecipeDetails = () => {
  const [recipe, setRecipe] = useState(null);
  const [liked, setLike] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [comments, setComments] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [diets, setDiets] = useState([]);
  const [steps, setSteps] = useState([]);
  const [commentTxt, setCommentTxt] = useState("");
  const [newRating, setRating] = useState(5);
  const [addedToShoppingList, setShopping] = useState(false);
  // console.log(user);
  const { recipe_id } = useParams();
  const recipeStyles = {
    // margin: "0 auto",
  };
  const [user, setUser] = useState(null);
  const fetchShoppingList = async recipe_id => {
    let added = false;
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    };

    let query = `http://localhost:8000/recipe/shopping_list/`;

    const response = await axios.get(query, config);
    for (let recipe of response.data.results) {
      if (recipe.recipe_id === recipe_id) {
        added = true;
        break;
      }
      setShopping(added);
    }
  };
  useEffect(() => {
    try {
      axios
        .get("http://localhost:8000/accounts/user/edit/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        })
        .then(({ data }) => {
          setUser(data);
        })
        .catch(error => setError(error.response));
    } catch (error) {
      window.alert("something wrong");
    }
    fetchShoppingList();
  }, []);

  const fetchRecipe = () => {
    console.log(recipe_id);
    if (recipe_id !== null && user !== null) {
      axios
        .get(`http://127.0.0.1:8000/recipe/${recipe_id}/details/`)
        .then(res => {
          const data = res.data;

          if (data.media_list.length === 0) {
            data.media_list.push({
              media_file: "/Default_Image_Thumbnail.png",
            });
          }
          for (const index in data.step_list) {
            const step = data.step_list[index];
            console.log(step);
            if (step.media_list.length === 0) {
              step.media_list.push({
                media_file: "/Default_Image_Thumbnail.png",
              });
            }
          }
          setRecipe(data);
          console.log(data);
          setSteps(data.step_list);
          setComments(data.comment_list);
          setIngredients(data.ingredients);
          setLike(data.likes.includes(user.id));
          setDiets(data.diets);
        })
        .catch(error => {
          console.log(error);
          setError(error.response);
          // alert(error.response.data.detail);
        });
    }
  };

  useEffect(fetchRecipe, [user, recipe_id]);
const addToShoppingList = async () => {
    await axios(`http://localhost:8000/recipe/shopping_list/add/${recipe_id}/`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    console.log("adding to shopping list")
    setShopping(true)
    // .catch(error => alert(error.response))
  
}
const RemoveFromShoppingList = async () => {
  await axios(`http://localhost:8000/recipe/shopping_list/add/${recipe_id}/`, {
    method: "delete",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  })
  console.log("deleting to shopping list")
  setShopping(false)
  // .catch(error => alert(error.response))

}
const deleteRecipe = async () => {
  await axios(`http://localhost:8000/recipe/${recipe_id}/`, {
    method: "delete",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  })
  alert("deleted this recipe")
  window.location = "http://localhost:3000/"
}
  const likeRecipe = async () => {
    await axios(`http://127.0.0.1:8000/recipe/${recipe_id}/like/`, {
      method: "put",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    setLike(prev => {
      if (prev) {
        recipe.like_num -= 1;
        return false;
      } else {
        recipe.like_num += 1;
        return true;
      }
    });
  };
  console.log(comments);
  const addComment = (text, rating) => {
    axios
      .post(
        `http://127.0.0.1:8000/recipe/${recipe.id}/add_comment/`,
        {
          rating,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        fetchRecipe();
      })
      .catch(error => {
        console.log(error);
        setError("Add Comment: " + error.response);
        // alert(error.response.data.detail);
      });
  };
  const renderAddComment = () => {
    return (
      <Card>
        <Box sx={{ p: "15px" }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar src={user && user.profile_pic} alt="user-avatar" />
            <Rating
              onChange={e => {
                e.preventDefault();
                setRating(e.target.value);
              }}
            />
            <TextField
              multiline
              fullWidth
              minRows={4}
              id="outlined-multilined"
              placeholder="Add a comment"
              value={commentTxt}
              onChange={e => {
                setCommentTxt(e.target.value);
              }}
            />
            <Button
              size="large"
              sx={{
                bgcolor: "custom.moderateBlue",
                color: "neutral.white",
                p: "8px 25px",
                "&:hover": {
                  bgcolor: "custom.lightGrayishBlue",
                },
              }}
              onClick={e => {
                addComment(commentTxt.trim(), newRating);
                comments.push({ text: commentTxt.trim(), rating: newRating });
              }}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Card>
    );
  };
  const renderRecipe = () => {
    console.log(recipe.media_list);
    return (
      <Grid container spacing={2} className="text-start" style={recipeStyles}>
        <Grid item xs={12} className="recipe h1 mx-5 mt-4">
          Recipe: {recipe.name}
        </Grid>
        <Grid item xs={12} className="article-header">
          <div className="description h5 mx-5 ">{recipe.description}</div>
        </Grid>
        <Grid container item className="article">
          {/* here are all the basic info for a recipe */}
          <Grid item xs={6} className="media-list">
            <ImageGallery
              showPlayButton={false}
              showFullscreenButton={false}
              items={recipe.media_list.map(media => {
                media.original = media.media_file;
                media.originalHeight = "300px";
                media.originalWidth = "300px";
                const url = media.media_file;
                let extension = ""
                if (url) {
                  extension = url.substring(
                  url.lastIndexOf(".") + 1,
                  url.length
                );
                }
                
                if (["mp4", "avi", "wmv"].includes(extension)) {
                  media.renderItem = video => {
                    return (
                      <video controls muted height={"300px"} width={"100%"}>
                        <source src={video.original} />
                      </video>
                    );
                  };
                }
                return media;
              })}
            />
          </Grid>
          <Grid item xs={6}>
            <ListWrapper>
              <Info>
                <Button
                  className={activeTab === "basic-info" ? "active" : ""}
                  onClick={() => setActiveTab("basic-info")}
                >
                  Basic Information
                </Button>
                <Button
                  className={activeTab === "Ingredients" ? "active" : ""}
                  onClick={() => setActiveTab("Ingredients")}
                >
                  Ingredients
                </Button>
                <Button
                  className={activeTab === "Diets" ? "active" : ""}
                  onClick={() => setActiveTab("Diets")}
                >
                  Diets
                </Button>
              </Info>

              {activeTab === "basic-info" && (
                <BasicInfoWrapper>
                  <div>
                    {" "}
                    Overall rating:{" "}
                    <Rating
                      value={parseFloat(recipe.overall_rating.toFixed(1))}
                      disabled
                    />
                    {recipe.overall_rating.toFixed(1)}
                    {"/5.0  "}
                  </div>
                  <div> Cooking time: {recipe.cook_time} Minutes</div>
                  <div> Preparation time: {recipe.prep_time} Minutes</div>
                  <div> Servings: {recipe.serving} </div>
                  <div> Cuisine: {recipe.cuisine} </div>
                  <div>
                    Likes: {recipe.like_num}
                    <IconButton
                      color="primary"
                      onClick={() => {
                        likeRecipe();
                        // setLike(prev => !prev)
                      }}
                      aria-label="upload picture"
                      component="label"
                    >
                      {liked ? (
                        <Favorite style={{ color: "red" }} />
                      ) : (
                        <FavoriteBorder style={{ color: "red" }} />
                      )}
                    </IconButton>
                  </div>
                  <div>
                    {" "}
                    Base Recipe:{" "}
                    {recipe.base_recipe
                      ? recipe.base_recipe
                      : "There is no base Recipe For this recipe."}{" "}
                  </div>
                  <div> Created By: {recipe.user && recipe.user.username} </div>
                  {addedToShoppingList ? (
                    <Button onClick={() => RemoveFromShoppingList()}>Remove From Shopping List</Button>
                  ) : (
                    <Button onClick={() => addToShoppingList()}>Add to Shopping List</Button>
                  )}
                  {
                    (recipe.user.id === user.id) ? 
                    <Button onClick={() => { window.location = "http://localhost:3000/edit/"+recipe_id }}>Edit this Recipe</Button>
                      :
                      <></>
                  }
                  {
                    (recipe.user.id === user.id) ? 
                    <Button onClick={() => { deleteRecipe() }}>Delete this Recipe</Button>
                      :
                      <></>
                  }
                </BasicInfoWrapper>
              )}
              {activeTab === "Ingredients" &&
                (ingredients === [] ? (
                  <p>There are no ingredients in this recipe</p>
                ) : (
                  <BasicInfoWrapper>
                    {ingredients.map((ingredient, index) => {
                      return (
                        <div key={index}>
                          {" "}
                          {ingredient.name}: {ingredient.amount} grams{" "}
                        </div>
                      );
                    })}
                  </BasicInfoWrapper>
                ))}
              {activeTab === "Diets" &&
                (diets === [] ? (
                  <p>There are no diets in this recipe</p>
                ) : (
                  <BasicInfoWrapper>
                    {diets.map((diet, index) => {
                      return <div key={index}> {diet.name}</div>;
                    })}
                  </BasicInfoWrapper>
                ))}
            </ListWrapper>
          </Grid>
        </Grid>
        <Grid item container rowGap={3} className="steps">
          <h2 style={{ margin: "2rem", marginLeft: "5rem" }}>
            Instructions/Steps
          </h2>
          <Grid item container rowGap={5} xs={12}>
            {steps === [] ? (
              <p>There are no steps in this recipe</p>
            ) : (
              steps.map((step, index) => {
                return (
                  <Grid item container xs={12} key={index}>
                    <Grid item xs={6}>
                      <BasicInfoWrapper>
                        {" "}
                        <div className="flex space-between w-100">
                          <h4>Step {step.order}</h4>
                          <div className="step-prep_time w-100">
                            Preparation Time: {step.prep_time} Minutes
                          </div>
                          <div className="step-cook_time w-100">
                            Cooking Time: {step.cook_time} Minutes
                          </div>
                        </div>
                        <div className="step-description">
                          Description: {step.description}
                        </div>
                      </BasicInfoWrapper>
                    </Grid>
                    <Grid item xs={6}>
                      <ImageGallery
                        showPlayButton={false}
                        showFullscreenButton={false}
                        items={step.media_list.map(media => {
                          media.original = media.media_file;
                          media.originalHeight = "300px";
                          media.originalWidth = "300px";
                          const url = media.media_file;
                          let extension = ""
                          if (url) {
                            extension = url.substring(
                            url.lastIndexOf(".") + 1,
                            url.length
                          );
                          }
                          
                          if (["mp4", "avi", "wmv"].includes(extension)) {
                            media.renderItem = video => {
                              return (
                                <video
                                  controls
                                  muted
                                  height={"300px"}
                                  width={"100%"}
                                >
                                  <source src={video.original} />
                                </video>
                              );
                            };
                          }
                          return media;
                        })}
                      />
                    </Grid>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Grid>
        <Grid
          item
          container
          rowGap={3}
          xs={12}
          style={{ margin: "0rem 5rem" }}
          className="comments w-100"
        >
          <Grid item className="" xs={12}>
            <h2>Review(s)</h2>
            <p>See what people say about this recipe.</p>
          </Grid>
          <Grid item container xs={12} className="mb-5 w-100">
            {/* <section id="reviews w-100">
              <div className="container-lg">
                <div className="row justify-content-center"> */}
            <Grid item xs={12}>
              {renderAddComment()}
            </Grid>
            {comments.length === 0 ? (
              <p className="bg-light">Sorry No comments yet.</p>
            ) : (
              <div className="col-8">
                <div className="list-group">
                  {comments.map((comment, index) => {
                    return (
                      <>
                        <Grid
                          container
                          className="my-3 bg-light"
                          columnGap={4}
                          key={index}
                        >
                          <Grid item xs={3} className="">
                            <div>
                              <Avatar
                                src={
                                  comment.user.profile_pic
                                    ? comment.user.profile_pic
                                    : "./Default_Image_Thumbnail.png"
                                }
                              />
                              {" " + comment.user && comment.user.username}
                            </div>
                            <div>
                              <Rating
                                disabled
                                value={parseFloat(comment.rating.toFixed(1))}
                                size={"small"}
                              />
                            </div>
                          </Grid>

                          <Grid item xs={8}>
                            {comment.text}
                          </Grid>
                        </Grid>
                      </>
                    );
                  })}
                </div>
              </div>
            )}
            {/* </div>
              </div>
            </section> */}
          </Grid>
        </Grid>
      </Grid>
    );
  };
  return error === null ? (
    <>
      {recipe === null || user === null ? (
        <div>
          <Spinner animation="border" role="status">
            <Row className="visually-hidden">Loading...</Row>
          </Spinner>
          Loading...
        </div>
      ) : (
        renderRecipe()
      )}
    </>
  ) : (
    <>
      {error && error.status} {error && error.data.detail}
    </>
  );
};

export default RecipeDetails;
