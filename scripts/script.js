import {addressQuery, placeDistance} from './api.js'
import { hostLocationQuery, saveLocation,saveToLocalStorage} from './dataTier.js'

let locationText = document.querySelector('#task')
let gas = document.querySelector('#gasValue')
let kmL = document.querySelector('#kmLitro')
let inputTask = document.querySelector('#addTask')
let resetList = document.querySelector('#resetList')
let list = document.querySelector('#taskList')
let place = JSON.parse(localStorage.getItem('Address List')) || []
let fuelValues = JSON.parse(localStorage.getItem('Values')) || []
let start = (place.length > 0) ? place[place.length -1].address : null
let host

document.addEventListener('DOMContentLoaded', function () {
    const addressModal = document.getElementById('addressModal');
    const saveAddressBtn = document.getElementById('saveAddress');
    const initialAddressInput = document.getElementById('initialAddress');

    let savedAddress = localStorage.getItem('userAddress');

    if (savedAddress) {
        addressModal.style.display = 'none';
    } else {
        addressModal.style.display = 'block';
    }
    
    saveAddressBtn.addEventListener('click', function () {
        const address = initialAddressInput.value.trim();
        if (address) {
            localStorage.setItem('userAddress', address);
            addressModal.style.display = 'none';
            hostLocationQuery()
        } else {
            alert('Please enter a valid address.');
        }
    })
})

window.addEventListener('load', () => {  
    updateList()
})

inputTask.addEventListener('click', (event) => {
    event.preventDefault()
    const inputLocation = locationText.value
    const inputGas = parseFloat(gas.value)
    const inputKmL = parseFloat(kmL.value)

    if(isDuplicateAddress(inputLocation)){
        alert('address already added') 
        return
    } 

    inputLocation ? saveLocation(inputLocation, inputKmL, inputGas) : alert('Please enter an address!')
    locationText.value = ''
})

resetList.addEventListener('click', (event) => {
    event.preventDefault()
    localStorage.clear()
    locationText.value = ''
    gas.value = 0
    kmL.value = 0
    setStart(null)
    setHost(null)
    window.location.reload()
})

export function updateList(){
    list.innerHTML = ''
    let totalQuilometers = 0
    let totalCost = 0

    const totalQuilometersItem = document.createElement('li')
    const totalQuilometersText = document.createElement('span')
    const totalCostText = document.createElement('span')

    place.forEach((place, index) => {
        const listItem = document.createElement('li')
        const listText = document.createElement('span')
        const quilometerText = document.createElement('span')
        const buttonConteiner = document.createElement('div')
        const editButton = document.createElement('button')
        const deleteButton = document.createElement('button')
    
        listItem.classList.add("rounded", "text-white", "bg-dark", "d-flex", "justify-content-between", "p-2")
        listText.textContent = `Address : ${place.address}`

        quilometerText.textContent = `Km : ${place.km}`

        totalQuilometers += parseFloat(place.km)
        
        buttonConteiner.classList.add('d-flex')
    
        editButton.classList.add("btn", "btn-primary", "m-2", "rounded")
        editButton.textContent = 'Edit'
        editButton.onclick = (event) => {
            event.preventDefault()
            editListItem(index)
        }
    
        deleteButton.classList.add("btn", "btn-danger", "m-2", "rounded")
        deleteButton.textContent = 'Delete'
        deleteButton.onclick = (event) => {
            event.preventDefault()
            deleteListItem(index)
        }
    
        buttonConteiner.appendChild(editButton)
        buttonConteiner.appendChild(deleteButton)
        listItem.appendChild(listText)
        listItem.appendChild(quilometerText)
        listItem.appendChild(buttonConteiner)
        list.appendChild(listItem) 
    });

    totalQuilometersItem.classList.add("rounded", "text-white", "bg-dark", "d-flex", "justify-content-between", "p-2");

    totalQuilometersText.textContent = `Total km: ${totalQuilometers.toFixed(2)} km`

    fuelValues[0] ? totalCost = (totalQuilometers / parseFloat(fuelValues[0].kmL)) * parseFloat(fuelValues[0].fuel) : totalCost = 0.00

    totalCostText.textContent = 'Total Fuel Cost: R$ ' +  totalCost.toFixed(2)

    totalQuilometersItem.appendChild(totalQuilometersText)
    totalQuilometersItem.appendChild(totalCostText)
    list.appendChild(totalQuilometersItem)
}

async function editListItem(index) {
    const newInputLocation = prompt('Edit address: ', place[index].address)
    if(!newInputLocation || newInputLocation == null) return

    if(isDuplicateAddressTotal(newInputLocation)) {
        alert('address already added') 
        return
    }

    try{
        let endAux = await addressQuery(newInputLocation)

        if(index == 0) {
            let distance = await placeDistance(host, endAux)
            place[index].address = newInputLocation
            place[index].km = distance

            if(place.length > 1) {
                let startAux = endAux
                endAux = await addressQuery(place[index + 1].address)
                distance = await placeDistance(startAux, endAux)
                place[index + 1].km = distance
            }
        }else {
            let startAux = await addressQuery(place[index - 1].address)
            let distance = await placeDistance(startAux, endAux)
            place[index].address = newInputLocation
            place[index].km = distance

            if(index < place.length - 1) {
                startAux = endAux
                endAux = await addressQuery(place[index + 1].address)
                distance = await placeDistance(startAux, endAux)
                place[index + 1].km = distance
            }
        }
        saveToLocalStorage()
        window.location.reload()
    }catch(error){
        console.error("Error editing list item:", error)
        alert('Failed to edit the address. Please try again.')
    }
}

async function deleteListItem(index){
    try {
        if(index == 0  && index != place.length - 1){
            let endAux = await addressQuery(place[index + 1].address)
            let distance = await placeDistance(host, endAux)
            place[index + 1].km = distance
        }else{
            if(index != place.length - 1){
                let endAux = await addressQuery(place[index + 1].address)
                let startAux = await addressQuery(place[index - 1].address)
                let distance = await placeDistance(startAux, endAux)
                place[index + 1].km = distance
            }
        }
    }catch(error){
        console.error("Error delete list item:", error)
        alert('Failed to delete the address. Please try again.')
    }

    place.splice(index,1)
    saveToLocalStorage()
    window.location.reload()
}

function isDuplicateAddress(newAddress) {
    const lastAddress = place.length > 0 ? place[place.length - 1].address.toLowerCase() : null

    return lastAddress !== null && newAddress.toLowerCase() === lastAddress.toLowerCase()
}

function isDuplicateAddressTotal(newAddress) {
    return place.some(place => place.address.toLowerCase() === newAddress.toLowerCase())
}

export function getHost(){
    return host
}

export function getStart(){
    return start
}

export function getFuelValues(){
    return fuelValues
}

export function getFuelValuesIndex(index){
    return fuelValues[index]
}

export function getPlace(){
    return place
}

export function setHost(host_aux){
    host = host_aux
}

export function setStart(start_aux){
    start = start_aux
}

export function setFuelValues(inputKmL,inputGas){
    fuelValues.push({kmL: inputKmL, fuel: inputGas})
}

export function setPlace(inputLocation, distance){
    place.push({address: inputLocation, km: distance})
}
