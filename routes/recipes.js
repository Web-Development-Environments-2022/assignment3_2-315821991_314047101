var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));



/**
 * This path returns recipe's preview details + expanded data: servings amount, cooking instructions, ingredients list & amounts 
 */
 router.get("/ExpandeRecipeData", async (req, res, next) => {
  // send parameters by : http://localhost:3000/recipes/ExpandeRecipeData?recipeID=2222 for example
  try {
    let recipeID=req.query.recipeID;
    let recipe;

    if(recipeID > 0)
    {
      recipe = await recipes_utils.getRecipeExpandedDetails(recipeID);
    }

    try{
      let user_id = req.session.user_id;
      if(recipeID < 0)
      {
        recipe = await user_utils.getRecipeExpandedData(user_id, recipeID);
      }
      await user_utils.updateThreeLastViewedRecipesList(user_id,recipeID);
      await user_utils.updateViewedRecipesHistory(user_id,recipeID); // adding to the history table
      res.send(recipe);
    }
    catch (error) {
      res.send({ failure: true, message: "ExpandeRecipeData- you should first log in the site" });
     }    
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the last 3 recipe's viewed by the current user  */
 router.get("/getThreeLastViewedRecipes", async (req, res, next) => { 
  try {
    try{
      let user_id = req.session.user_id;
       reslist = await user_utils.getThreeLastViewedRecipesList(user_id);
       res.send(reslist);
     }
     catch (error) {
      res.send({ failure: true, message: "you should first log in the site" });
     }  
     
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns all the recipes viewed by the logged-in user
 */
 router.get("/getAllHistory", async (req, res, next) => {
  try {
    try{
      let user_id = req.session.user_id;
      console.log(user_id);
      const recipe= await user_utils.getViewedRecipesHistory(user_id); 
      res.send(recipe);
     }
     catch (error) {
      res.send({ failure: true, message: "problem inside getViewedRecipesHistory"  });
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
    let user_id = req.session.user_id;
    let recipe_id = req.params.recipeId;
    let recipe;
    if(recipe_id > 0)
    {
    recipe = await recipes_utils.getRecipeDetails(recipe_id);
    }
    else{
      recipe = await user_utils.getRecipePerviewData(user_id, recipe_id);
    }
     res.send(recipe);
   }
   catch (error) {
    res.send({ failure: true, message: "recipeId-you should first log in the site" });
   }  
  } 
  catch (error) {
    next(error);
  }
});




module.exports = router;
