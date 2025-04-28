const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Generate time slots from 9:00 AM to 2:00 PM
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 14; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(time);
        if (hour < 14) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }
    return slots;
};

exports.getAppointments = async (req, res) => {
    try {
        const timeSlots = generateTimeSlots();
        const appointments = await Appointment.find({})
            .populate('bookedBy', 'username')
            .sort({ date: 1, time: 1 });

        res.render('appointment', {
            loggedIn: true,
            userType: req.session.userType,
            timeSlots,
            appointments,
            error: req.query.error,
            success: req.query.success
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).render('error', { 
            message: 'Failed to load appointments',
            error
        });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const { date, time } = req.body;
        
        // Validate input
        if (!date || !time) {
            return res.redirect('/appointment?error=Date and time are required');
        }

        // Check for existing appointment
        const existing = await Appointment.findOne({ date, time });
        if (existing) {
            return res.redirect('/appointment?error=Time slot already exists');
        }

        // Create new appointment
        await Appointment.create({ date, time });
        
        res.redirect('/appointment?success=Time slot created successfully');
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.redirect('/appointment?error=Failed to create time slot');
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await Appointment.findByIdAndDelete(id);
        res.redirect('/appointment?success=Time slot deleted successfully');
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.redirect('/appointment?error=Failed to delete time slot');
    }
};