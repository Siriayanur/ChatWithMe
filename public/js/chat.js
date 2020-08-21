//CLient side Js
const socket = io()

//Elements
const messageForm = document.querySelector('#sendMessage')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix : true})
const autoscroll = () => {
    //New message
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    //How far have i scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        
        //If we need the chat to always scroll to the bottom then  this line is enough
        messages.scrollTop = messages.scrollHeight
    }


}

    //Listen to message given from server => socket.on()
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        // First is the property key and the next is the value taken by the socket.on() function above
        username : message.username,
        message: message.text, 
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

//Exclusive for the location message
socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username : location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    }) 
    messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


messageForm.addEventListener('submit', (e) => {

    //Disable after submission
    messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value

    //Thirs argument i.e function is an acknowledgement to send to the server that the message was received
    socket.emit('sendMessage', message, (error) => {
        messageFormButton.removeAttribute('disabled')
        //Clear the input
        messageFormInput.value = ''
        messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('message delivered')
    })
    e.preventDefault()
})

document.querySelector('#send-location').addEventListener('click'
    , () => {
        if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
        }
        
        //disable the button if the location is still getting fetched
        locationButton.setAttribute('disabled','disabled')

        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                latitude:position.coords.latitude,
                longitude:position.coords.longitude
            }
            socket.emit('sendLocation', location, () => {
                locationButton.removeAttribute('disabled')
                console.log('Location Shared')
            })
        })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        //Redirect the user to the entry page
        location.href = '/'
    }
})










// add a button

//inside the function socket.on()
// buttonIncrement.textContent = count;

// let updatedCount = 0;
// let buttonIncrement = document.createElement('button')
// buttonIncrement.textContent = updatedCount
// document.getElementById('buttonRender').appendChild(buttonIncrement)