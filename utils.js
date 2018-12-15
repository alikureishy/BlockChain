/**
 * A utility method to convert from JSON to a Map object
 * @param {string} json 
 */
const jsonToMap = ( json => {
    let obj = JSON.parse(json);
    const mp = new Map;
    Object.keys ( obj ). forEach (k => { mp.set(k, obj[k]) });
    return mp;
});

/**
 * A utility method to convert from a Map object to a JSON string
 * @param {string} aMap 
 */
const mapToJSON = ( aMap => {
    const obj = {};
    aMap.forEach ((v,k) => { obj[k] = v });
    return JSON.stringify(obj);
});

module.exports = {
    jsonToMap: jsonToMap,
    mapToJSON: mapToJSON
}