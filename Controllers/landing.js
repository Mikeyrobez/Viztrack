const path = require('path');

/////////Handler for rendering the landing page
exports.get_landing = function (req, res) {
    res.render('landing', { title: 'Home' });
}

////////Handler for redirect
exports.redirect_viztrack = function (req, res) {
    console.log("registered redirect");
    res.redirect('/Viztrack');
}

exports.get_viztrack = function (req, res) {
    //res.render('viztrack', { title: 'Viztrack' });
    console.log("redirecting");
    res.sendFile(path.join(__dirname, '../views', 'viztrack.html')); /////this makes the send file relative so that anyone can use it
    //res.sendFile( 'C:/dev/Viztrack/Viztrack/views/viztrack.html');
}