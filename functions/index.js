const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const body_parser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());
app.use(cors({origin: true, credentials: true}));

const stripe = require('stripe')('sk_test_51OpEKjFsVOqGvUD1uSipKGIKgUmXRSGzlC4ontHiogfiQwjCH8LFh5ZmUA9lY8a3EnS2rCi0ymuQGUEKDezmtwcD00pgNlVJTp');

app.post('/checkout', async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: req.body.items.map(item => ({
                price_data: {
                    currency: 'huf',
                    product_data: {
                        name: item.film_title + ': ' + item.type,
                        description: item.cinema + ' ' + item.auditorium_number + '.terem ' + convertSeats(item.chosen_seat) + ' ' + formatScreeningTime(item.screening_time)
                    },
                    unit_amount: (item.price + 100) * 100
                },
                quantity: 1
            })),
            mode: 'payment',
            success_url: 'https://movie-ticket-booking-webapp.web.app/success-payment',
            cancel_url: 'https://movie-ticket-booking-webapp.web.app/cancel-payment'
        });

        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
});

exports.api = functions.https.onRequest(app);


function convertSeats(seat) {
    const [row, seatNumber] = seat.split('/');
    return `${row}.sor: ${seatNumber}.szék`;
}

function formatScreeningTime(screeningTime) {
    const dateObj = new Date(screeningTime);
    
    // Hozzáadunk két órát
    dateObj.setHours(dateObj.getHours() + 2);
    
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Az órák formátumának 24 órás formátumban való megjelenítése
    };
    
    return dateObj.toLocaleDateString('hu-HU', options);
}

const admin = require('firebase-admin');
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
    // get user and add custom claim (admin)
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: true
        });
    }).then(() => {
        return {
            success: true
        }
    }).catch(error => {
        return error;
    });
});

exports.addModeratorRole = functions.https.onCall((data, context) => {
    // get user and add custom claim (moderator)
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            moderator: true
        });
    }).then(() => {
        return {
            success: true
        }
    }).catch(error => {
        return error;
    });
});

exports.addSuperadminRole = functions.https.onCall((data, context) => {
    // get user and add custom claim (superadmin)
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            superadmin: true
        });
    }).then(() => {
        return {
            success: true
        }
    }).catch(error => {
        return error;
    });
});

const nodemailer = require('nodemailer');
const environment = require('./environments/environment.json');

exports.sendEmailNotification = functions.https.onCall((data, context) => {
    const user = data.user;
    const tickets = data.tickets;

    let authData = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: environment.SENDER_EMAIL,
            pass: environment.SENDER_PASSWORD
        }
    });

    authData.sendMail({
        from: 'no-reply@movie-ticket-booking-webapp.com',
        to: user.email,
        subject: 'Mozijegy rendelés',
        html: `
        <html>
            <head>
                <style>
                    table {
                        font-family: Arial, sans-serif;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #dddddd;
                        text-align: center;
                        padding: 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h1>Kedves ${user.name.firstname} ${user.name.lastname}!</h1>
                <p>Ez itt a mozijegy rendelésének visszaigazolása:</p>
                <table>
                    <tr>
                        <th>Film címe</th>
                        <th>Jegy típusa</th>
                        <th>Ár</th>
                        <th>Város</th>
                        <th>Terem szám</th>
                        <th>Vetítés ideje</th>
                        <th>Foglalt szék</th>
                    </tr>
                    ${tickets.map(ticket => `
                        <tr>
                            <td>${ticket.film_title}(${ticket.screening_type})</td>
                            <td>${ticket.type}</td>
                            <td>${ticket.price} Ft</td>
                            <td>${ticket.cinema}</td>
                            <td>${ticket.auditorium_number}.</td>
                            <td>${formatScreeningTime(ticket.screening_time)}</td>
                            <td>${convertSeats(ticket.chosen_seat)}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
        </html>
    `
    }).then(_ => console.log('email sent successfully')).catch(error => console.log(error));
});

exports.sendEmailNotificationAfterCancellation = functions.https.onCall((data, context) => {
    const user = data.user;
    const ticket = data.ticket;

    let authData = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: environment.SENDER_EMAIL,
            pass: environment.SENDER_PASSWORD
        }
    });

    authData.sendMail({
        from: 'no-reply@movie-ticket-booking-webapp.com',
        to: user.email,
        subject: 'Foglalás lemondva',
        html: `
        <html>
            <head>
                <style>
                    table {
                        font-family: Arial, sans-serif;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #dddddd;
                        text-align: center;
                        padding: 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h1>Kedves ${user.name.firstname} ${user.name.lastname}!</h1>
                <p>Ezt a foglalást mondta le:</p>
                <table>
                    <tr>
                        <th>Film címe</th>
                        <th>Jegy típusa</th>
                        <th>Város</th>
                        <th>Terem szám</th>
                        <th>Vetítés ideje</th>
                        <th>Foglalt szék</th>
                    </tr>
                    <tr>
                        <td>${ticket.film_title}(${ticket.screening_type})</td>
                        <td>${ticket.type}</td>
                        <td>${ticket.cinema}</td>
                        <td>${ticket.auditorium_number}.</td>
                        <td>${formatScreeningTime(ticket.screening_time)}</td>
                        <td>${convertSeats(ticket.chosen_seat)}</td>
                    </tr>
                </table>
            </body>
        </html>
    `
    }).then(_ => console.log('email sent successfully')).catch(error => console.log(error));
});