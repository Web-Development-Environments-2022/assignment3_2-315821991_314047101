var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path returns a recipe expanded data: list of 
 */
 router.get("/ExpandeRecipedata", async (req, res, next) => {
  // send parameters by : http://localhost:3000/recipes/search?query=pasta&recipeID=654959 for example
  try {
    const recipe = await recipes_utils.getRecipeExpandedDetails(req.query.recipeID);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns 3 random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    let three_random_recipes = await recipes_utils.getRandomThreeRecipes();
    res.send(three_random_recipes);
  } catch (error) {
    next(error);
  }
});

// search for recipes , choose how many results to recieve
router.get("/search", async (req, res, next) => {
  // send parameters by : http://localhost:3000/recipes/search?query=pasta&number=2 for example
  try {
    // by default: number = 5
    var number = req.query.number || 5;
    let search_results = await recipes_utils.getSearchResults(req.query.query, number);
    res.send(search_results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    let user_id = req.session.user_id; 
    const reslist = await user_utils.getRecipesList(user_id,req.params.recipeId); 
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
