const socket = require("socket.io");
const formatMessage = require("../utils/functions");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { userJoin, userLeave, getRoomUsers } = require("../utils/user");

const JWT_SECRET_KEY = process.env.MY_CUSTOM_SECRET_KEY;

const initializeSocket = (server) => {
    const io = socket(server);
    io.on("connection", (socket) => {
        socket.on("joinRoom", (token) => {
            try {
                const decoded = jwt.verify(token, JWT_SECRET_KEY);
                const { username, room } = decoded;
                const user = userJoin(socket.id, username, room)
                console.log('user', user);
                socket.join(user.room)
                socket.emit("message", formatMessage("BOT", `Welcome ${user.username}`));
                socket.broadcast.to(user.room).emit(
                    "message",
                    formatMessage("BOT", `${user.username} just connected`)
                );
                io.to(user.room).emit("usersInRoom", {
                    room: user.room,
                    usersList: getRoomUsers(user.room),
                    });
            } catch (err) {
                console.log(err);
            }
        })
     
        socket.on("chatMsg", (data) => {
            const { msg, token } = data;
            try {
            const decoded = jwt.verify(token, JWT_SECRET_KEY);
            const { username, room } = decoded;
            io.to(room).emit("message", formatMessage(username,
            msg));
            } catch (error) {
            console.error(error);
            }
        })
    
        socket.on("disconnect", () => {
            const user = userLeave(socket.id)
            if(user){
                io.to(user.room).emit("message", formatMessage("BOT",`${user.username} is disconnected`));

                io.to(user.room).emit("usersInRoom", {
                    room: user.room,
                    usersList: getRoomUsers(user.room),
                    });
            } 
        });
    });
}

module.exports = initializeSocket