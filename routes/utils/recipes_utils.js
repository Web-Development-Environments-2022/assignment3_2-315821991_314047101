const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
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
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

// Extract recipes data from given recipes array 
function extractPreviewRecipeDetails(recipes_info)
{
    return recipes_info.map((recipes_info) => {
        let data = recipes_info;
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
        } = data;
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
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
async function getRecipesFromSearch(given_query, number_of_wanted_results) {
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            number: number_of_wanted_results,
            query: given_query,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// return search results by using spoonacular API
async function getSearchResults(given_query, number_of_wanted_results) {
    let response = await getRecipesFromSearch(given_query, number_of_wanted_results);
    recipes_arr = response.data.results;
    const recipes_arr_splitted = [];
    for (let i = 0; i < recipes_arr.length; i++) {
        recipes_arr_splitted.push(recipes_arr[i]);
    }
    return extractPreviewRecipeDetails(recipes_arr_splitted);
}

exports.getSearchResults = getSearchResults;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.getRecipeDetails = getRecipeDetails;



