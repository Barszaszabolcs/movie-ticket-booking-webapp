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
            success_url: 'http://localhost:4201/success-payment',
            cancel_url: 'http://localhost:4201/cancel-payment'
        });

        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
});

app.listen(4200, () => console.log('app is running'));


function convertSeats(seat) {
    const [row, seatNumber] = seat.split('/');
    return `${row}.sor: ${seatNumber}.szék`;
}

function formatScreeningTime(screeningTime) {
    const dateObj = new Date(screeningTime);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return dateObj.toLocaleDateString('hu-HU', options);
}