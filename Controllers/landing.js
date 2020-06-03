
/////////Handler for rendering the landing page
exports.get_landing = function (req, res) {
    res.render('landing', { title: 'Express' });
}

////////Handler for email submittion
exports.submit_lead = function (req, res) {
    console.log("lead email:", req.body.lead_email);
    res.redirect('/');
}