const users = [];

const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required'
    }
  }

  // check if the user already exists
  const existingUser = users.find((user) => user.room == room && user.username === username)

  // validate username
  if (existingUser) {
    return {
      error: 'Username is in use'
    }
  }

  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
}

const removeUser = (id) => {
  // users.filter((user) => user.id === id); // keeps running even after a match is found

  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

const getUser = (id) => {
  return users.find((user) => user.id === id);

}

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);

}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}