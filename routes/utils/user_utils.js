const { use } = require("../recipes");
const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function UpdateLastViewedRecipesList(user_id, recipe_id){
    const username=await DButils.execQuery(`select username from users where user_id='${user_id}'`);
    let recipe_1_check = await DButils.execQuery(`select recipe_1 from history3 where username='${username[0].username}'`);
    let recipe_2_check = await DButils.execQuery(`select recipe_2 from history3 where username='${username[0].username}'`);
    let recipe_3_check = await DButils.execQuery(`select recipe_3 from history3 where username='${username[0].username}'`);
  
    recipe_1_check=recipe_1_check[0].recipe_1;
    recipe_2_check=recipe_2_check[0].recipe_2;
    recipe_3_check=recipe_3_check[0].recipe_3;
    
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


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.UpdateLastViewedRecipesList = UpdateLastViewedRecipesList;
