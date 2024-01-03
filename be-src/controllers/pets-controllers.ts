import { Report, Pet, User } from "../models"
import { uploadCloudinary } from "../lib/cloudinary"
import { index } from "../lib/algolia"

//Algolia
async function saveGeoLocation(data) {
  try {
    const algoliaRes = await index.saveObject({
      objectID: data.petId,
      _geoloc: {
        lat: data.lat,
        lng: data.lng
      }
    }).then(() => { })
  } catch (error) {
    throw error

  }
}

async function deletePetAlgolia(petId) {
  try {
    index.deleteObject(petId).then(() => {
      console.log("the pet has been removed");
    })
  } catch (error) {
    throw error
  }
}

function dataGeoLocation(data, id?) {
  const response: any = {};
  if (data.lat && data.lng) {
    response._geoloc = { lat: data.lat, lng: data.lng };
  }
  if (id) {
    response.objectID = id;
  }
  return response;
}

export async function updateGeoLocation(data, petId) {

  const indexResponse = dataGeoLocation(data, petId);
  try {
    const algoliaResponse = await index.partialUpdateObject(indexResponse);
  } catch (error) {
    console.log(error);
  }
}


export async function createPet(data, userId) {
  let petImageURL

  if (data.imageURL) {
    try {

      const imageRes = await uploadCloudinary(data.imageURL)

      petImageURL = imageRes.secure_url
    } catch (e) {
      throw e
    }
  }
  const petData = {
    name: data.petName,
    lat: data.lat,
    lng: data.lng,
    found: false,
    image_URL: petImageURL,
    zone: data.zoneReport,
    userId: userId

  }
  try {
    const createdPet = await Pet.create({
      ...petData
    })
    let algoliaResponse = await saveGeoLocation(
      {
        lat: petData.lat,
        lng: petData.lng,
        petId: createdPet.get("id")
      })
    return createdPet
  } catch (error) {
    throw error
  }

}


function petData(data) {
  const response: any = {};
  if (data.petName) {
    response.name = data.petName;
  }

  if (data.lat && data.lng) {
    response.lat = data.lat
    response.lng = data.lng
  }
  if (data.imageURL) {
    response.image_URL = data.imageURL
  }
  if (data.zoneReport) {
    response.zone = data.zoneReport
  }

  return response;
}

export async function updatePet(data, id) {
  if (data.imageURL) {
    const imageRes = await uploadCloudinary(data.imageURL)
    data.imageURL = imageRes.secure_url
  }
  if (data.lat && data.lng && data.zoneReport) {
    await updateGeoLocation(data, id)
  }
  const dataToUpdate = petData(data)
  console.log(dataToUpdate);

  const updatePet = await Pet.update(dataToUpdate, {
    where: {
      id
    }
  })
  return updatePet
}

export async function getAllPets() {
  try { return await Pet.findAll({}) 
} catch (error) {
    throw error
  }
}

export async function getAllPetsWithIds(ids: Array<Number | String>) {
  try {
    return await Pet.findAll({
      where: { id: ids, found: false }
    })
  } catch (error) {
    throw error
  }
}


export async function petsAroundMe(lat, lng) {
  try {
    const { hits } = await index.search("", {
      aroundLatLng: `${lat}, ${lng}`,
      aroundRadius: 100000
    })
    const processedHits = processHits(hits)
    const petsAroundMeResponse = await getAllPetsWithIds(processedHits)
    return petsAroundMeResponse
  } catch (error) {
    throw error
  }
}
function processHits(hits) {
  const response = hits.map((h) => {
    return h.objectID
  })

  return response;
}
export async function reportPetFound(id) {
  try {
    const petFound = await Pet.update({ found: true }, {
      where: {
        id
      }
    })
    return petFound
  } catch (error) {
    throw error
  }
}
export async function deletePetById(id) {
  try {
    await deletePetAlgolia(id)
    return Pet.destroy({
      where: {
        id
      }
    })
  } catch (error) {
    throw error
  }
}

export async function allPetsByUser(req, selectedFields) {
  try {

    return await Pet.findAll({
      where: {
        userId: req,
      },
      attributes: selectedFields,
    })
  } catch (error) {
    throw error
  }
}

export async function deleteAllPets() {
  return Pet.destroy({
    where: {}
  })
}