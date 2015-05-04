module.exports = function(def, provided) {
    if (provided)
        for (var key in def) {
            if (provided.hasOwnProperty(key))
                def[key] = provided[key]
        }

    return def
}