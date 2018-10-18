

//Load Defaults


var template = {}

template.peopleList = async function(obj={}) {
	let htmlList = ``
	if(!Array.isArray(obj.itemListElement)) { obj.itemListElement = [ obj.itemListElement ] }
	for (let i of obj.itemListElement) {
		let item
		switch(typeof i) {
			case "string" : //Then it is probably just a URL, resolve like normal		
			item = await fetch(i).then(response=>response.json()).catch()
			break
			case "object" : //Then we need the id to resolve so we can trust the object
			item = await fetch(i["@id"] || i.id).then(response=>response.json()).catch()
			break
			default :
			// We were given something very weird. Just move forward.
			// This will cause a fail on this person
			item = {}
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
	return htmlList;
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



