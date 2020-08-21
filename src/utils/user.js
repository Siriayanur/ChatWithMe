const users = []
const addUser = ({id, username, room}) => {
    
    //Filter the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if (!username || !room) {
        return {
            error : 'Username and password are required'
        }
    }

    //Check for existing user
    const existingUser = users.find(( user ) => {
        return room === user.room && username === user.username;
    })

    //Validate the existing user
    if (existingUser) {
        return {
            error : 'username is already taken'
        }
    }

    //Store the valid user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return { user : user }
}

const removeUser = (id) => {
    //-1 if no , position if exists
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index === -1) {
        return {
            error: 'Sorry there is no such user'
        }
    } else {
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    })
    
    if (index === -1) {
        return {
            error : 'Sorry, No such user exists'
        }
    } else {
        return users[index];
    }

}

//Alternative smarter code 
//const getUser = (id) => {
    //return users.find({user} => user.id===id)
// }

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
