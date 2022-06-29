const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey:process.env.spooncular_apiKey
        }
    });
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree, 
    }
}

// Get expanded recipe data - input = recipe ID, output = preview details + servings amount, cooking instructions, ingredients list & amounts
async function getRecipeExpandedDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);

    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, analyzedInstructions, extendedIngredients, servings} = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree, 
        servings: servings,
        analyzedInstructions: analyzedInstructions,
        extendedIngredients: extendedIngredients,
    }
}

// Extract recipes data from given recipes array 
function extractPreviewRecipeDetails(recipes_info)
{
    return recipes_info.map((recipes_info) => {
        let data = recipes_info;
        if(data < 0)
        {
            return data;
        }
        if(recipes_info.data)
        {
            data = recipes_info.data;
        }
        const {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
            analyzedInstructions,
        } = data;
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            analyzedInstructions: analyzedInstructions,
        }
    })
}

// return 3 random recipes, by using spoonacular API
async function getRandomThreeRecipes() {
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    recipes_arr = response.data.recipes;
    return extractPreviewRecipeDetails([recipes_arr[0],recipes_arr[1],recipes_arr[2]]);
}

// search for recipes by using: given_query as string to search, return  number_of_wanted_results results
async function getRecipesFromSearch(given_query, number_of_wanted_results, cuisine, diet, intolerance) {
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            number: number_of_wanted_results,
            query: given_query,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerance,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// get the preview of list of recipes
async function getRecipesPreview(recipes_ids_list) {
    let promises = [];
    recipes_ids_list.map((id) => {
        if(id > 0)
        {
            promises.push(getRecipeInformation(id));
        }
        else{
            promises.push(id);
        }
    });

    let info_res = await Promise.all(promises);
    return extractPreviewRecipeDetails(info_res);
  }

// Get recipe information for group of ids 
async function getRecipesInfoBulks(ids_list) {
    return await axios.get(`${api_domain}/informationBulk`, {
        params: {
            ids: ids_list,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// Return search results (all needed data) by using spoonacular API
async function getSearchResults(given_query, number_of_wanted_results, cuisine, diet, intolerance) {
    let response = await getRecipesFromSearch(given_query, number_of_wanted_results, cuisine, diet, intolerance);
    recipes_arr = response.data.results;
    let string_of_ids = ""
    // collect ids of all recipes
    for (let i = 0; i < recipes_arr.length; i++) {
        string_of_ids += recipes_arr[i].id;
        if(i < recipes_arr.length-1)
        {
            string_of_ids += ","
        }
    }
    // get all needed data for those ids
    let recipes_full_data = await getRecipesInfoBulks(string_of_ids); 
    const recipes_arr_splitted = [];
    for (let i = 0; i < recipes_full_data.data.length; i++) {
        recipes_arr_splitted.push(recipes_full_data.data[i]);
    }
    return extractPreviewRecipeDetails(recipes_arr_splitted);
}

// get search filtering options from DB
async function getSearchFilteringOptions() {
    const options = await DButils.execQuery(`select * from search_filter_options`);
    return [
        [options[0].filter_options],
        [options[1].filter_options],
        [options[2].filter_options],
    ]
}

exports.getSearchFilteringOptions = getSearchFilteringOptions;
exports.getRecipesPreview = getRecipesPreview;
exports.getSearchResults = getSearchResults;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.getRecipeDetails = getRecipeDetails;
exports.getRecipeExpandedDetails = getRecipeExpandedDetails;



