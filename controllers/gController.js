const User = require('../models/User');

exports.getGPage = async (req, res) => {
    try {
        res.render('g_page', {
            loggedIn: true,
            userType: req.session.userType,
            userData: null,
            error: req.query.error
        });
    } catch (error) {
        console.error('Error in getGPage:', error);
        res.redirect('/g_page?error=An error occurred');
    }
};

exports.searchByLicense = async (req, res) => {
    try {
        const { licenseNumber } = req.body;
        const userData = await User.findOne({ LicenseNo: licenseNumber })
            .populate({
                path: 'appointmentId',
                transform: doc => {
                    if (!doc) return null;
                    return {
                        ...doc._doc,
                        date: doc.date instanceof Date ? doc.date : new Date(doc.date)
                    };
                }
            });

        if (!userData) {
            return res.render('g_page', {
                loggedIn: true,
                userType: req.session.userType,
                userData: null,
                error: 'No user found with this license number'
            });
        }

        res.render('g_page', {
            loggedIn: true,
            userType: req.session.userType,
            userData,
            error: null
        });
    } catch (error) {
        console.error('Error in searchByLicense:', error);
        res.redirect('/g_page?error=An error occurred during search');
    }
};