var http = require('http'); //angualar js
var url = require('url');
var server = http.createServer().listen(4000);
// server.listen(0, () => {
//     console.log(server.address().port)
// })
// console.log("line 3",server)
var io = require('socket.io').listen(server);

var cookie_reader = require('cookie');
// console.log("line 6",cookie_reader)
var querystring = require('querystring');
// console.log("line8",querystring)
 
var redis = require('socket.io/node_modules/redis');
// console.log("line10",redis)
var sub = redis.createClient();
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var xhttp = new XMLHttpRequest();
//Subscribe to the Redis chat channel
// var channels = ['test','foo','bar']
sub.subscribe("iot");

// var new_server=http.createServer(function (request, response) {
  
//     response.writeHead(200, {'Content-Type' : 'application/json'});

//     var adr = request.url;
//     var q = url.parse(adr, true);
//     console.log(q.host);
// console.log(q.pathname);
// console.log(q.search);
// console.log(q.query);
//     response.end("Id is = " + q.pathname)
// }).listen(8000,'127.0.0.1');
// console.log("server is",new_server._events.request); 
//Configure socket.io to store cookie set by Django
io.configure(function(){
    // io.set('transports',['xhr-polling']);
    io.set('authorization', function(data, accept){  //it save the cookie from the headers
        // console.log("dhifhdhf",data)
        if(data.headers.cookie){
            // console.log("00"+data.headers.cookie);
            data.cookie = cookie_reader.parse(data.headers.cookie);
            return accept(null, true);
        }
        //  console.log("009"+data.headers.cookie);
        return accept('error', false);
    });
    io.set('log level', 1);
});
// io.set('origins', '*:*');
io.sockets.on('connection', function (socket) {
    console.log('Client connected...');   

    //Grab message from Redis and send to client
    sub.on('message', function(channel, message){
        new_message=JSON.parse(message)
        console.log("channel is ",new_message.channel_name)
        console.log("redis message",new_message.data)
        socket.emit((new_message.channel_name),new_message.data);
    });
    
    //Client is sending message through socket.io
    //socket.io waits for a message or event from index.html file, and here is 'send_0message' 
    // socket.on('send_message', function (message) {
    //     console.log("39",message);
    //     socket.emit("message-1","hi from server")
    //     values = querystring.stringify({
    //         comment: message,
    //         sessionid: socket.handshake.cookie['sessionid'],
    //     }); 

    //     // console.log(values.length)

    //     var options = {

    //         host: '127.0.0.1',
    //         port: 3000,
    //         path: '/node_api',
    //         method: 'POST',
    //         data:values,
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             'Content-Length': values.length,
    //         }

    //     };
    //     console.log("62",options)
    //     //Send message to Django server
    //     var req = http.get(options, function(res){
    //         res.setEncoding('utf8');
    //         console.log("line 73",res)
    //         //Print out error message
    //         res.on('data', function(message){
    //             if(message != 'Everything worked :)'){
    //                 console.log('Message: ' + message);
    //             }
    //         });
    //     });
    //     console.log(values)
    //     req.write(values);
    //     console.log("line 81",req.write)
    //     req.end();
    //     // console.log("lilne 83",req.end)
        // var url = 'http://127.0.0.1:3000/node_api';

        // // when the request finishes
        // xhttp.open('POST', url, true);
       
        // // sends the data to the view
        // xhttp.send(values);
  
        // xhttp.onreadystatechange = function() {
        //     // it checks if the request was succeeded
        //     if(this.readyState === 4 && this.status === 200) {
        //         console.log("xhttp entering")
        //         // if the value returned from the view is error
        //         if(xhttp.responseText === "error")
        //             console.log("error saving message");
        //         // if the value returned from the view is success
        //         else if(xhttp.responseText === "success")
        //             console.log("the message was posted successfully");
        //     }
        // };

        // prepares to send
        
    // });
});