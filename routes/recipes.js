var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns the three last viewed recipes
 */
 router.get("/threeLastViewedRecipes", async (req, res, next) => {
     // send parameters by : http://localhost:3000/recipes/threeLastViewedRecipes?user_id=1 for example
  try {
    const last_viewed = await recipes_utils.getThreeLastViewedRecipes(req.query.user_id);
    res.send(last_viewed);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns recipe's preview details + expanded data: servings amount, cooking instructions, ingredients list & amounts 
 */
 router.get("/ExpandeRecipeData", async (req, res, next) => {
  // send parameters by : http://localhost:3000/recipes/ExpandeRecipeData?recipeID=2222 for example
  try {
    const recipe = await recipes_utils.getRecipeExpandedDetails(req.query.recipeID);
    try{let user_id = req.session.user_id;  // todo - move into getRecipeInformation
    reslist = await user_utils.UpdateLastViewedRecipesList(user_id,req.query.recipeID); // todo - move into getRecipeInformation
    res.send(recipe);
    }
    catch (error) {
      res.send({ failure: true, message: "you should first log in the site" });
     }    
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
  // send parameters by : http://localhost:3000/recipes/search?query=pasta&number=&cuisine=African,American&diet=Vegetarian&intolerance=Dairy for example
  // only the "query" parameter is required
  try {
    // by default: number = 5
    var number = req.query.number || 5;

    // include Search - filtering parameters
    let search_results = await recipes_utils.getSearchResults(req.query.query, number, req.query.cuisine, req.query.diet, req.query.intolerance);
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
   try{
    let user_id = req.session.user_id;  // todo - move into getRecipeInformation
    // console.log(user_id)
     reslist = await user_utils.UpdateLastViewedRecipesList(user_id,req.params.recipeId); // todo - move into getRecipeInformation
     const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
     res.send(recipe);
   }
   catch (error) {
    res.send({ failure: true, message: "you should first log in the site" });
   }  
  } 
  
  catch (error) {
    next(error);
  }
});

module.exports = router;
