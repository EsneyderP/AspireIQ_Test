/**
 *
 * Author:  Jhoan Esneyder Peña
 * Email: esneideramy@gmail.com
 * Description: Utility Mapper method for mutations that will be applied to a JSON document.
 * Helps to identify the mutation type just like: $add/$update/$remove, and sorts all the mutations to be applied in the mentioned order.
 *
 * License: MIT - Copyright (c) Jhoan Esneyder Peña
 * @link https://github.com/EsneyderP/AspireIQ_Test
 *
 */

/**
 * Contains all the mapped mutations
 */
let mapped_muttations = [];

/**
 * Saves the temporary path for each mutation
 */
let mutation_path = [];

module.exports = {
    /**
     * Inits the mutations mapping process and performs ordering for the result by priority: 
     * first $add, then $update and then $remove
     * 
     * @param    {Object} mutation The object mutation that is going to be mapped
     * @returns  {Array} The mapped mutations with the following structure:
     * 
     * {    
     *      @param {Array} path The path with the mapped steps to iterate into the main document
     *      @param {Object} path.propKey The name of the property in the path
     *      @param {Object} path.propValue The value associated to the [propKey] if any.
     *      @param {Object} action The action that the mutation is going to perform: $add/$update/$remove
     *      
     * }
     */
    getMappedMutations : function (mutation) {

        mapped_muttations = [];
        if(Object.keys(mutation).length > 0)
        {
            mapping(mutation, {"mutation": mutation});
        }
        
        // Sort mutations by priority
        mapped_muttations.sort(function (a, b) {
            if (a.priority > b.priority) {
              return 1;
            }
            if (a.priority < b.priority) {
              return -1;
            }
            // a must be equal to b
            return 0;
        });

        return mapped_muttations;
    }
}

/**
 * Generate the mapping of the provided mutation 
 * by splitting each one into an array of individual $add/$update/$remove mapped_muttations object
 * and creating a path for easy looping trhough the main document
 * 
 * Depends of a 'mapped_muttations' and 'mutation_path' global arrays!
 * 
 * @param    {Object} mutation The object mutation that is going to be mapped
 * @param    {Object} context The context of the mapped instance
 * @param    {Object} context.mutation The mutation object that is being processed
 * @param    {Object} [context.current_path] Stores the current path of the processed mutation
 * @param    {Boolean} [context.ignore_main_property] Ignores the [main_property] to be added to the path for the processed mutation
 * @param    {String} [context.main_property] The name of the direct property where the update statement is going to be applied
 * 
 * @returns  {Void}
 */
function mapping(mutation, context) {
    
    // Validate if current object contains nested arrays of objects
    const nested_mutations = Object.keys(mutation).filter(mIndex => Array.isArray(mutation[mIndex]) && (typeof mutation[mIndex] === 'object') );
    
    // Calculate the path for the current processed mutation part
    mutation_path = [];

    // Keep the current path for the current processed mutation
    if(context.current_path && context.current_path.length > 0)
        mutation_path = [...context.current_path];
    
    if(context.main_property && !context.ignore_main_property) { 
        if(typeof mutation === 'object' && '_id' in mutation)
            mutation_path.push({propKey: context.main_property}, {propKey: '_id', propValue: mutation._id});
        else
            mutation_path.push({propKey: context.main_property});
    }

    // Lets start getting the type of mutation   
    if(typeof mutation === 'object' && nested_mutations.length == 0) {
    
        let action = '$add';
        if('_id' in mutation && !('_delete' in mutation))
            action = '$update';
        else 
        {
            if('_delete' in mutation)
                action = '$remove';
        }       
        
        // Set priority flag for ordering: first $add, then $update and then $remove
        let priority = 3;
        if(action == "$add")
            priority = 1;
        else if(action == "$update")
                priority = 2;

        // Create the mapped_muttations object
        mapped_muttations.push({
            "path": [...mutation_path],
            "action": action,
            "priority": priority,
            "data": context.mutation
        });
    }
    else {

        /* Getting the current generated path for the current processed mutation
         * Avoiding reference to the main path array */
        const current_path = [...mutation_path];

        // Get common_mutations mutations that doesn't contain nested arrays or objects
        // Ignoring _id property
        const common_mutations = Object.keys(mutation).filter(mIndex => mIndex != '_id' && !Array.isArray(mutation[mIndex]) && !(typeof mutation[mIndex] === 'object'));
        
        /* Start processing common mutations */
        if(common_mutations.length > 0) {

            common_mutations.forEach(child => {
                let current_mutation = {};
                current_mutation[child] = context.mutation[child];
                // looping for each mutation inside the child object        
                mapping(current_mutation,   {                            
                                                "ignore_main_property": true, // Avoid duplicates for the same step in path
                                                "mutation": current_mutation, // Mutation part
                                                "main_property": context.main_property, // Main prop key that is being processed
                                                "current_path": current_path 
                                            });       
            });
        }

        /* If there are nested_mutations arrays of mutation objects, 
         * start processing each one of them */
        if(nested_mutations.length > 0) {

            nested_mutations.forEach(child => {
                for(let i=0; i < context.mutation[child].length; i++)
                {           
                    mapping(context.mutation[child][i], {
                                                            "ignore_main_property": false, // Avoid duplicates for the same step in path
                                                            "mutation": context.mutation[child][i], // Mutation part from child object
                                                            "main_property": child, // Main prop key that is being processed
                                                            "current_path": current_path 
                                                        });
                } 
            });
        }
    }
}