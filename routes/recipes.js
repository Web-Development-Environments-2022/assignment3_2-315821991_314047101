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
      res.send({ failure: true, message: "ExpandeRecipeData - you must login in order see those recipes" });
      }    

  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the last 3 recipe's viewed by the current user  */
 router.get("/getThreeLastViewedRecipes", async (req, res, next) => { 
  // request for example: http://localhost:3000/recipes/getThreeLastViewedRecipes
  try {
    try{
      let user_id = req.session.user_id;
       reslist = await user_utils.getThreeLastViewedRecipesList(user_id);
       let recipes_id_array = [];
       reslist.map((element) => recipes_id_array.push(element)); //extracting the recipe ids into array
       let results;
      try{
         results = await recipes_utils.getRecipesPreview(recipes_id_array);
       }
       catch (error) {
        res.send({ failure: true, message: "can't retrive these recipes details" });
       } 
      if(results.length==0)
       res.status(200).send( `The user with id:'${user_id}' have not seen any recipes yet`);
      else
      {
        for (let i = 0; i < results.length; i++) {
          if(results[i] < 0)
          {
            results[i] = await user_utils.getRecipePerviewData(user_id, results[i]);
          }
        }
        res.status(200).send(results);
      }
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
      const recipe= await user_utils.getViewedRecipesHistory(user_id); 
      let recipes_id_array = [];
      recipe.map((element) => recipes_id_array.push(element.Observed_recipe)); //extracting the recipe ids into array

      if(recipes_id_array.length==0)
      res.status(200).send(`The user with id:'${user_id}' have not seen any recipe yet`);
      else
      res.status(200).send(recipes_id_array);
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
  // send parameters by : http://localhost:3000/recipes/search?query=pasta&number=5&cuisine=African,American&diet=Vegetarian&intolerance=Dairy for example
  // only the "query" parameter is required
  try {
    //adding field to seission for saving last searches
    if (req.session && req.session.user_id) {
      req.session.last_search=req.query.getSearchResults
    }


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
