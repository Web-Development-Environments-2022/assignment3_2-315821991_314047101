var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));

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
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

router.post("/:recipeID",async(req,res,next)=> {
  try{
    let recipe_details = {
      username: "Talya123", 
      recipe_to_add: recipe.id}//TODO: change to the currnt user that now is log in------------------
    
      let cur_users = [];
      const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
      cur_users = await DButils.execQuery("SELECT username from history3");  
      if (cur_users.find((x) => x.username === recipe_details.username))
  
  
       {
           console.log('found that the user exist already')
           reslist= x.recipeslist;
           console.log("check how to print json list")
           console.log(reslist);
       }
  
       else{
         console.log('found that the user not exist already')
         let recipe_to_add=[recipe.id];
     
         await DButils.execQuery(       
        `INSERT INTO history3 VALUES ('${recipe_details.username}', '${recipe_to_add}')`
       );
       console.log('added new eecpie to history');
    
  }}

  catch (error) {
    next(error);
  }
     

});

module.exports = router;
