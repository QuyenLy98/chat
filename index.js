var express = require('express');
var app = express();
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', './views');
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 3000);

var manguseronline = [];

io.on('connection', function (socket) {
  console.log('co nguoi ket noi: ' + socket.id);

  socket.on('client-send-user', function (data) {
    if (manguseronline.indexOf(data) >= 0) {
      socket.emit('server-send-dktb', data);
    } else {
      manguseronline.push(data);
      socket.Username = data;
      io.sockets.emit('server-send-dktc', { username: data, id: socket.id });
      socket.emit('server-send-hidedk', [socket.id, data]);
    }
  });
  socket.on('client-send-message', function (data) {
    socket.broadcast.emit('server-send-message', [socket.Username, data]);
    socket.emit('server-send-message-my', data);
  });

  socket.on('user-choc-userkhac', function (data) {
    io.to(data).emit('server-to-userkhac', socket.Username);
  });

  socket.on('client-logout', function () {
    let index = manguseronline.indexOf(socket.Username);
    manguseronline.splice(index, 1);
    io.sockets.emit('thongbao', socket.id);
    socket.emit('server-logout');
  });

  socket.on('client-users-online', function () {
    socket.emit('server-users-online', manguseronline);
  });

  socket.on('disconnect', function () {
    let index = manguseronline.indexOf(socket.Username);
    manguseronline.splice(index, 1);
    io.sockets.emit('thongbao', socket.id);
  });

  socket.on('client-go-message', function () {
    socket.broadcast.emit('server-send-aido', socket.Username);
  });

  socket.on('client-out-message', function () {
    socket.broadcast.emit('server-send-out-aido');
  });
});

app.get('/', function (req, res) {
  res.render('trangchu');
});
