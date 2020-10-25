const mutationsMapper = require('./utils/mutationsMapper');

module.exports = {
    /**
     * Returns the update statement of the applied mutations to the document provided
     * 
     * @param    {Object} doc The original document where the changes will be performed
     * @param    {Object} mutation The object mutation that describes only what needs updating in the original document
     * @returns  {Object} outputs The output that contains the update statement for all mutations
     */
    generateUpdateStatement: function(doc, mutation) { 

        // Store the current mutation outputs for all update statements
        let outputs = {};

        // Get the mapped mutations sort by priority: $add -> $update -> $remove
        const mMutations = mutationsMapper.getMappedMutations(mutation);

        // Verify if there are mutations to be applied
        if(mMutations.length > 0) 
        {
            // Loops through all the mapped mutations applying it to the original document
            mMutations.forEach(mMutation => {

                let output = {};
                output = modifyDocument(doc, mMutation);

                if(!outputs[mMutation.action]) {
                    outputs[mMutation.action] = output;
                }
                else
                {
                    // Supporting multiple mutations of the same type
                    outputs[mMutation.action] = [outputs[mMutation.action]];
                    outputs[mMutation.action].push(output);
                }
            });
            
        }

        return outputs;
    }
}

/**
 * Applies the mutation object provided (wich may contains Add/Update/remove operations), into the passed document,
 * 
 * @param    {Object} doc The original document where the changes will be performed
 * @param    {Object} mutation The object mutation previously mapped
 * @returns  {Object} The output that contains the update statement
 */
function modifyDocument(doc, mutation) {

    // Copy without reference of the doc for update managment until the process
    let new_doc = {...doc};

    // Store the current mutation path concatenation for the output creation
    let mutation_path = '';

    // Store the current mutation output update statement
    let output = {};
  
    try {
        if(Object.keys(new_doc).length > 0 && Object.keys(mutation).length > 0) {

            // Let's loop through the mutation path
            mutation.path.forEach( (step, index) => {
                
                let objIndex = -1;
                if(Array.isArray(new_doc[step.propKey])) {
                    
                    new_doc = new_doc[step.propKey];
                    if(mutation_path != '')
                        mutation_path += '.' + step.propKey;
                    else
                        mutation_path += step.propKey;
                }
                else
                {
                    // Here, an _id key should be present, so we need to get the index of the object in the array
                    if(Array.isArray(new_doc) && step.propValue) {
                        objIndex = new_doc.findIndex(obj => obj[step.propKey] == step.propValue);

                        if(objIndex >= 0) {
                            mutation_path += '.' + objIndex;

                            /* Update the new_doc with the nested value only if the action in not for deletion
                            * and it's the last iteration, due to the $remove mutation needs to keep the parent doc
                            * in order to performs the slice
                            * */
                            if(!(index+1 == mutation.path.length && mutation.action == "$remove"))
                                new_doc = new_doc[objIndex];
                        }
                        else
                        {
                            // Property not found
                            mutation_path += '.{not_found}';
                            output[mutation_path] = [{"error": `The property {${step.propKey}: ${step.propValue}} was not found`, data:  mutation.data}];
                            return;
                        }

                    }
                    else 
                    {
                        // Avoid output logs for future objects after the first {not_found} error
                        if(step.propKey == '_id' || mutation_path.indexOf('{not_found}') != -1)
                            return;
                        // Property not found
                        mutation_path += '.{not_found}';
                        output[mutation_path] = [{"error": `The property {${step.propKey}} was not found`, data:  mutation.data}];
                        return;
                    }
                }

                // If all iteration path steps have finished, apply the changes acording to the action
                if(index+1 == mutation.path.length) {
                    // Apply the change
                    switch(mutation.action) {
                        case "$add":

                            // Add the new record by adding a new _id
                            if(Array.isArray(new_doc)) {
                                // Lets get the max current _id in the array's objects
                                const maxIndex = Math.max(...new_doc.map(item => item._id));
                                mutation.data['_id'] = maxIndex + 1;
                                new_doc.push(mutation.data);
                            }
                        
                            output[mutation_path] = [mutation.data];
                        break;
                        case "$update":

                            let uOuputs = {};

                            // Update the item(s) and keep a record od the updated ones
                            let updatedProperties = [];
                            if(typeof mutation.data == 'object') {
                                Object.keys(mutation.data).forEach(key => {
                                    if(key != '_id') {
                                        new_doc[key] = mutation.data[key];
                                        updatedProperties.push({key: key, value: mutation.data[key]})
                                    }
                                })
                            }

                            // Create the new output for update mutations
                            updatedProperties.forEach(uProp => {
                                uOuputs[mutation_path + '.' +uProp.key] = uProp.value;
                            });

                            output = uOuputs;
                        break;
                        case "$remove":
                            // Delete the item
                            new_doc.splice(objIndex, 1);
                            output[mutation_path] = mutation.data._delete;
                        break;
                    }                    
                }
            });

            mutation_path = '';

            // Updates the root document with the modified one
            doc = new_doc;

            return output;
        }
    }
    catch(error) {
        console.log(error);
    }

    return null;
}