const { use } = require("../recipes");
const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert ignore into FavoriteRecipes values ('${user_id}',${recipe_id})`);
    await DButils.execQuery(`select * from FavoriteRecipes where user_id='${user_id}'`);
}

async function unmarkAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert ignore into FavoriteRecipes values ('${user_id}',${recipe_id})`);
    await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE (user_id,recipe_id)=('${user_id}',${recipe_id})`);
    await DButils.execQuery(`select * from FavoriteRecipes where user_id='${user_id}'`);
}
    


async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getThreeLastViewedRecipesList(user_id){
    const username=await DButils.execQuery(`select username from users where user_id='${user_id}'`);
    let recipe_1_check = await DButils.execQuery(`select recipe_1 from history3 where username='${username[0].username}'`);
    let recipe_2_check = await DButils.execQuery(`select recipe_2 from history3 where username='${username[0].username}'`);
    let recipe_3_check = await DButils.execQuery(`select recipe_3 from history3 where username='${username[0].username}'`);
    let lastViewed=[]

     if(recipe_1_check.length != 0 && recipe_2_check.length == 0 && recipe_3_check.length == 0){
        lastViewed=[]
        lastViewed.push(recipe_1_check[0].recipe_1)
    }
    else if(recipe_1_check.length != 0 && recipe_2_check.length != 0 && recipe_3_check.length == 0){
        lastViewed=[]
        lastViewed.push(recipe_1_check[0].recipe_1)
        lastViewed.push(recipe_2_check[0].recipe_2)
    }
    else if(recipe_1_check.length != 0 && recipe_2_check.length != 0 && recipe_3_check.length != 0){
        lastViewed=[]
        lastViewed.push(recipe_1_check[0].recipe_1)
        lastViewed.push(recipe_2_check[0].recipe_2)
        lastViewed.push(recipe_3_check[0].recipe_3)
    }

    return lastViewed;

}

async function getViewedRecipesHistory(user_id){
    const username=await DButils.execQuery(`select username from users where user_id='${user_id}'`);  
    const Observed_recipe_object=await DButils.execQuery(`select Observed_recipe from history_all_recipes where username='${username[0].username}'`); 
    let Observed_recipe_list=[]
    for (let i = 0; i < Observed_recipe_object.length; i++) {
        Observed_recipe_list.push(Observed_recipe_object[i].Observed_recipe);       
    }

    return Observed_recipe_object;      
    }


async function updateThreeLastViewedRecipesList(user_id, recipe_id){
    const username=await DButils.execQuery(`select username from users where user_id='${user_id}'`);
    let recipe_1_check = await DButils.execQuery(`select recipe_1 from history3 where username='${username[0].username}'`);
    let recipe_2_check = await DButils.execQuery(`select recipe_2 from history3 where username='${username[0].username}'`);
    let recipe_3_check = await DButils.execQuery(`select recipe_3 from history3 where username='${username[0].username}'`);
    if(recipe_1_check.length == 0)
    {
        recipe_1_check=0;
        recipe_2_check=0;
        recipe_3_check=0;      
    }
    else{
        recipe_1_check=recipe_1_check[0].recipe_1;
        recipe_2_check=recipe_2_check[0].recipe_2;
        recipe_3_check=recipe_3_check[0].recipe_3;
    }
   
    if(recipe_1_check==0){ // history: [-,-,-]
        let recipe_1_add=recipe_id      
        await DButils.execQuery(`insert into history3 values ('${username[0].username}','${recipe_1_add}','${0}','${0}')`);
        return recipe_id;}    


    else if(recipe_2_check==0){ // history: [X,-,-]  
        let recipe_2_add=recipe_id ;
        if(recipe_1_check!=recipe_id ){ // if the recipe is not already in history then: history: [Y,X,-]  
            await DButils.execQuery(`UPDATE history3 SET recipe_1='${recipe_2_add}',recipe_2='${recipe_1_check}' WHERE username='${username[0].username}'`);
            await DButils.execQuery(`select * from history3 where username='${username[0].username}'`);
            return recipe_id;
        }
        return recipe_id;
        }
    
    else if(recipe_3_check==0){ // history: [Y,X,-]
        let recipe_3_add=recipe_id  

        if(recipe_1_check!=recipe_id && recipe_2_check!=recipe_id){ // if the recipe is not already in history then: history: [Z,Y,X]     
        await DButils.execQuery(`update history3 set recipe_1='${recipe_3_add}', recipe_2='${recipe_1_check}', recipe_3='${recipe_2_check}' where username='${username[0].username}'`);
        await DButils.execQuery(`select * from history3 where username='${username[0].username}'`);
        return recipe_id;
    }
        
         else if(recipe_2_check==recipe_id){ // if history: [Y,X,-], and  new recipe= X then: history: [X,Y,-]
            await DButils.execQuery(`update history3 set  recipe_1='${recipe_2_check}', recipe_2='${recipe_1_check}', recipe_3='${0}' where username='${username[0].username}'`);
            await DButils.execQuery(`select * from history3 where username='${username[0].username}'`);
            return recipe_id;
        }
        
         else{
            return recipe_id;
        }
        }
     
    else{
        let recipe_3_add=recipe_id
        if(recipe_1_check!=recipe_id && recipe_2_check!=recipe_id && recipe_3_check!=recipe_id){// history: [Z,Y,X]           
            await DButils.execQuery(`update history3 set  recipe_1='${recipe_3_add}', recipe_2='${recipe_1_check}', recipe_3='${recipe_2_check}' where username='${username[0].username}'`);
            await DButils.execQuery(`select * from history3 where username='${username[0].username}'`);
            return recipe_id;}
        
        else if(recipe_2_check==recipe_id){ //history: [Z,X,Y] and new recipe= X
            await DButils.execQuery(`update history3 set  recipe_1='${recipe_2_check}','${recipe_1_check}','${recipe_3_check}' where username='${username[0].username}'`);
            await DButils.execQuery(`select * from history3 where username='${username[0].username}'`);
            return recipe_id;}

        else if(recipe_3_check==recipe_id){ //history: [Z,X,Y] and new recipe= Y
            await DButils.execQuery(`update history3 set  recipe_1='${recipe_3_check}', recipe_2='${recipe_1_check}', recipe_3='${recipe_2_check}' where username='${username[0].username}'`);
            await DButils.execQuery(`select * from history3 where username='${username[0].username}'`);
            return recipe_id;}

        else{
            return recipe_id;}
            
        }
        
}



async function updateViewedRecipesHistory(user_id, recipe_id){
    const username=await DButils.execQuery(`select username from users where user_id='${user_id}'`);
    await DButils.execQuery(`insert ignore into history_all_recipes values ('${username[0].username}','${recipe_id}')`);
    await DButils.execQuery(`select * from history_all_recipes where username='${username[0].username}'`); 
    return recipe_id;      
    }


async function getFamilyRecipes(given_user_id){
    const recipes=await DButils.execQuery(`select * from family_recipes where user_id='${given_user_id}'`);
    if(recipes.length == 0)
    {
        return "According to our records you have no family recipes...";
    }
    recipe_1 = recipes[0];
    recipe_2 = recipes[1];
    recipe_3 = recipes[2];

    const response = 
    {
        user_id: given_user_id,
        recipe_1:{
            recipe_id: recipe_1.recipe_id,
            recipe_name: recipe_1.recipe_name,
            recipe_owner: recipe_1.recipe_owner,
            when_used: recipe_1.when_used,
            ingredients: recipe_1.ingredients,
            analyzedInstructions: recipe_1.instructions,
        },
        recipe_2:{
            recipe_id: recipe_2.recipe_id,
            recipe_name: recipe_2.recipe_name,
            recipe_owner: recipe_2.recipe_owner,
            when_used: recipe_2.when_used,
            ingredients: recipe_2.ingredients,
            analyzedInstructions: recipe_2.instructions,
        },
        recipe_3:{
            recipe_id: recipe_3.recipe_id,
            recipe_name: recipe_3.recipe_name,
            recipe_owner: recipe_3.recipe_owner,
            when_used: recipe_3.when_used,
            ingredients: recipe_3.ingredients,
            analyzedInstructions: recipe_3.instructions,
        }
    }

    return response;
}


async function addPersonalRecipe(user_id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, servings, analyzedInstructions, extendedIngredients){
    // count how many rows we have in personal_recipes table and use this value to set recipe_id value (recipe_id is negative for personal recipes)
    const counter = (
        await DButils.execQuery(
            `SELECT COUNT(*) as count_val FROM personal_recipes`
        )
        )[0];
    
    await DButils.execQuery(
        `INSERT INTO personal_recipes VALUES ('${user_id}', '${(counter.count_val + 1) * (-1)}','${title}', '${readyInMinutes}', '${image}',
        '${aggregateLikes}', '${vegan}', '${vegetarian}', '${glutenFree}', '${servings}', '${analyzedInstructions}', '${extendedIngredients}')`
    );
    await DButils.execQuery(`select * from personal_recipes where user_id='${user_id}'`);

    return "The Recipe successfully saved in your personal recipes list!";
}


async function getRecipePerviewData(user_id, recipe_id){
    const recipe_info = (
        await DButils.execQuery(
            `select * from personal_recipes where user_id='${user_id}' AND id='${recipe_id}'`
        )
    )[0];
        
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info;
    
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

async function getRecipeExpandedData(user_id, recipe_id){
    const recipe_info = (
        await DButils.execQuery(
            `select * from personal_recipes where user_id='${user_id}' AND id='${recipe_id}'`
        )
    )[0];
        
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, analyzedInstructions, extendedIngredients, servings} = recipe_info;
  
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

async function getPersonalRecipes(user_id){
    const recipes = (
        await DButils.execQuery(
            `select id from personal_recipes where user_id='${user_id}' `
        )
    );
    reciped_preview = []
    for (let i = 0; i < recipes.length; i++) {
        reciped_preview[i] = await getRecipePerviewData(user_id, recipes[i].id);
    }
    return reciped_preview;
    
}

exports.getPersonalRecipes=getPersonalRecipes;
exports.getRecipeExpandedData = getRecipeExpandedData;
exports.getRecipePerviewData = getRecipePerviewData;
exports.addPersonalRecipe = addPersonalRecipe;
exports.getFamilyRecipes = getFamilyRecipes;
exports.markAsFavorite = markAsFavorite;
exports.unmarkAsFavorite = unmarkAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.updateThreeLastViewedRecipesList = updateThreeLastViewedRecipesList;
exports.getThreeLastViewedRecipesList=getThreeLastViewedRecipesList;
exports.updateViewedRecipesHistory=updateViewedRecipesHistory;
exports.getViewedRecipesHistory=getViewedRecipesHistory;
