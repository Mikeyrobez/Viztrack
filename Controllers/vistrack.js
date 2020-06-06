
/////////Handler for viztrack redirect
exports.get_viztrack = function (req, res) {
    res.render('viztrack', { title: 'Viztrack' });
}