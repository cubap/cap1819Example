

//Load Defaults


var template = {}

template.peopleList = async function(obj) {
	let htmlList = ``
	if(obj.itemListElement && obj.itemListElement.length > 0){
		for (var i = 0; i < obj.itemListElement.length; i++) {
			let objToUse = {}
			if(typeof obj.itemListElement[i] === "string"){
				//Then it is probably just a URL, resolve like normal
				objToUse = await get(obj.itemListElement[i])
			}
			else if(typeof obj.itemListElement[i] === "object"){
				//Then we need the id to resolve so we can trust the object
				objToUse = await get(obj.itemListElement[i]["@id"])
			}
			else{
				//We were given something very weird.   Just move forward as if we were given an empty object.
				objToUse = {}; //This will cause a fail on this person
			}
			//We only care about people in the aggregation
			if(objToUse["@type"] &&  objToUse["@type"]== "Person"){
				try {
	        		htmlList += `<li class="listPerson" person-id="${objToUse['@id']}" onclick="personClicked('${objToUse.name}')" >${objToUse.name}</li>`
			    } 
			    catch (err) {
			        htmlList += `<li class="listPerson">There was an error with person in list at index `+i+`</li>`
			    }
			}
			else{
				//This object is not a person, we won't know what to do with it.  
				htmlList += `<li class="listPerson">There was an error with item in aggregation at index `+i+`</li>`
			}	
		}
	}
	else{
		//There was no aggregating property in this object, or at least not the one we are looking for.  
		htmlList = `<li class="listPerson">Could not find people in this list</li>`
	}
	return htmlList;
}

/**
	*Get the json representation of an object given its URI.
	*If there is an error getting any URL, then return an object object.  Template functions should handle what they can't find.  
*/
async function get(url) {
	let response = await fetch(url)
	.catch(function(error){
		//Could not get this object from the internet.  Just move forward with an empty object, template functions should handle what they can't find.  
		console.log("Was not able to get URL "+url)
		return {}
	})
	let resp = {}
	if(response.ok){
		//We can parse it into json
		resp = response.json()
	}
    return resp;
}

async function renderElement(elem, tmp) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild)
    }
    if (tmp) {
        elem.innerHTML = await tmp
    }
}

async function doExample(listURL) {
    let resolvedObj = await get(listURL)
    renderElement(document.getElementById("personList"), template.peopleList(resolvedObj))
}

//simulate the page being handle an initial object.  It is most likely one would have to /query and filter for an object ahead of time.  
var initialList = "http://devstore.rerum.io/v1/id/5bc8089ce4b09992fca2222c"
doExample(initialList)



