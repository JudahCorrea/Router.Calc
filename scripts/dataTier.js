import {addressQuery, placeDistance} from './api.js'
import { updateList, getHost, getStart, getFuelValues,getFuelValuesIndex, getPlace, setHost, setStart, setFuelValues, setPlace} from './script.js'

export async function hostLocationQuery(){
    try{
        let hostLocation = await addressQuery(localStorage.getItem('userAddress'))
        setHost(hostLocation)
    }catch(error){
        console.log('Failed to acquire lat-lon:', error)
    }
}

export async function saveLocation(inputLocation,inputKmL,inputGas){
    let distance
    let end = await addressQuery(inputLocation)
    getPlace().length == 0 ? distance = await placeDistance(getHost(), end) :
    distance = await placeDistance(getStart(), end)
 
    setStart(end)
    setPlace(inputLocation, distance)

    if(!getFuelValuesIndex(0)) setFuelValues(inputKmL, inputGas)

    saveToLocalStorage()
    updateList()
}

export function saveToLocalStorage() {
    localStorage.setItem('Address List', JSON.stringify(getPlace()))
    if(getFuelValues().length == 1 || getFuelValues().length == 0)localStorage.setItem('Values', JSON.stringify(getFuelValues()))
}
