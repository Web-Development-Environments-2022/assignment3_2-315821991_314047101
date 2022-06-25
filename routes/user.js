var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * This path returns all users personal recipes
 */
router.get('/get_personal_recipe', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const response = await user_utils.getPersonalRecipes(user_id);
    res.status(200).send(response);
  } catch(error){
    next(error); 
  }
  });

/**
 * This path gets body with new recipe details, and saves it in the personal recipes DB
 */
 router.post('/add_personal_recipe', async (req,res,next) => {
  try{
    // add default image in case the user didn't give one
    image = req.body.image;
    if(image == undefined)
    {
      image = "https://spoonacular.com/recipeImages/2225-556x370.jpg";
    }
    const response = await user_utils.addPersonalRecipe(req.session.user_id,req.body.title, req.body.readyInMinutes, image, req.body.aggregateLikes, req.body.vegan, req.body.vegetarian, req.body.glutenFree, req.body.servings, req.body.analyzedInstructions, req.body.extendedIngredients);
    res.status(200).send(response);
    } catch(error){
    next(error);
  }
})



/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});



/**
 * This path returns the user's family recipes
 */
 router.get('/family_recipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const response = await user_utils.getFamilyRecipes(user_id);
    res.status(200).send(response);
  } catch(error){
    next(error); 
  }
});

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    if(results.length==0)
      res.status(200).send(`The user with id:'${user_id}' have not added any favorite recipe yet`);
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

  } catch(error){
    next(error); 
  }
});


/**
 * This path returns the recipe id of all favorites the logged-in user have
 */
 router.get('/get_favorites_ids', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
});


/**
 * This path gets body with recipeId and remove this recipe in the favorites list of the logged-in user
 */
//TODO: change it to post becous deleete shuld not have a bode
//router.delete('/favorite/:recipeID', async (req,res,next) => {
 router.delete('/favorite', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.unmarkAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully un-marked as favorite");
    } catch(error){
    next(error);
  }
})





module.exports = router;
