

//Load Defaults


var template = {}

template.peopleList = async function(obj={}) {
	let people = Array.isArray(obj.itemListElement) ? obj.itemListElement : [ obj.itemListElement ]
	let peoplePromise = []
	for (let i of people) {
		switch(typeof i) {
			case "string" : //Then it is probably just a URL, resolve like normal		
			peoplePromise.push(fetch(i).then(response=>response.json()).catch(err=>console.log(err.message)).then(peopleWash))
			break
			case "object" : // Then we need the id to resolve so we can trust the object
			if((i["@type"]||i.type) && (i["@type"]||i.type).indexOf("Person")===-1) {
				continue // Some other type; do not fetch
			}
			peoplePromise.push(fetch(i["@id"] || i.id).then(response=>response.json()).catch(err=>console.log(err.message)).then(peopleWash))
			break
			default :
			// We were given something very weird. Just discard.
		}
	}
	peoplePromise = peoplePromise.filter(p=>p===null) //We only care about people in the aggregation
	let persons = await Promise.all(peoplePromise).catch(err=>console.log(err.message))
	return persons.map(person=>`<li class="listPerson" person-id="${person['@id']}" onclick="personClicked('${person['@id']}')" >${person.name || "[ anonymous ]"}</li>`).join()
}

function peopleWash(obj) {
	if((obj["@type"]||obj.type).indexOf("Person")===-1) {
		return null
	}
	return obj
}

async function renderElement(elem, tmp=null) {
    while (elem.firstChild) {
		// probably not strictly necessary.
        elem.removeChild(elem.firstChild)
    }
	elem.innerHTML = await tmp
}

async function doExample(listURL) {
    let resolvedObj = await fetch(listURL).then(response=>response.json()).catch(err=>console.log(err.message))
    renderElement(personList, template.peopleList(resolvedObj))
}

//simulate the page being handle an initial object.  It is most likely one would have to /query and filter for an object ahead of time.  
var initialList = "http://devstore.rerum.io/v1/id/5bc8089ce4b09992fca2222c"
doExample(initialList)



