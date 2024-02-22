export async function addressQuery(address) {
    const base_get = 'https://nominatim.openstreetmap.org/search?format=json'
    
    try{
        const request = await fetch(`${base_get}&q=${address}`)

        if(!request.ok){
            throw new Error(`HTTP error! status: ${request.status}`)
        }

        const data = await request.json()
        const longitude = data[0].lon
        const latitude = data[0].lat
        const place = [longitude, latitude]
        return place
    }catch(error){
        console.log('Failed to acquire lat-lon:', error)
    }
}

export async function placeDistance(starting, ending) {
    const key = '5b3ce3597851110001cf6248ccd8f51f18de44a98676e849b7eac5de'
    
    const header = {
        method: 'POST',
        headers : {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Content-Type': 'application/json',
            'Authorization': `${key}`
        },
        body: JSON.stringify({"coordinates":[[...starting], [...ending]]})
    }

    try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-hgv", header);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const point_distance = data.routes[0].summary.distance
        return parseFloat((point_distance.toFixed(2))/1000).toFixed(2)
    } catch (error) {
        console.error('Failed to calculate distance:', error)
        return null
    }
}
