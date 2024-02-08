export interface Screening {
    id: string;
    film_title: string;
    day: number;
    time: number;
    length: number;
    type: string;
    language: string;
    occupied_seats: Array<string>;
    filmId: string;
    adminId: string;
    auditoriumId: string;
}