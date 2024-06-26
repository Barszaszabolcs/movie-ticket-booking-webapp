export interface Ticket {
    id: string;
    type: string;
    price: number;
    payed: boolean;
    film_title: string;
    cinema: string;
    auditorium_number: number;
    screening_time: number;
    chosen_seat: string;
    date?: number;
    screening_type: string;
    glasses: boolean;
    screeningId: string;
    userId: string;
    prizeId: string;
}